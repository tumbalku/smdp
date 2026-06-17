import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import { VerificationStatus, Role } from "@prisma/client";

export interface UploadDocumentInput {
  ownerId: string;
  documentTypeId: string;
  fileBuffer: Buffer;
  originalFileName: string;
  issueDate?: Date;
  expiryDate?: Date;
}

export async function uploadDocument(input: UploadDocumentInput) {
  const {
    ownerId,
    documentTypeId,
    fileBuffer,
    originalFileName,
    issueDate,
    expiryDate,
  } = input;

  // 1. Fetch document type details
  const docType = await prisma.documentType.findUnique({
    where: { id: documentTypeId },
  });

  if (!docType) {
    throw new Error("Jenis dokumen tidak ditemukan.");
  }

  // 2. Validate expiry date if required
  if (docType.requiresExpiryDate && !expiryDate) {
    throw new Error(
      "Tanggal masa berlaku wajib diisi untuk jenis dokumen ini."
    );
  }

  // 3. Check if there is already an existing record of the same document type for this owner
  const existingRecord = await prisma.documentRecord.findFirst({
    where: {
      ownerId,
      documentTypeId,
    },
  });

  const oldFilePath = existingRecord ? existingRecord.filePath : null;

  // 4. Upload file to StorageProvider
  const storage = getStorageProvider();
  const filePath = await storage.upload(
    fileBuffer,
    originalFileName,
    docType.name.toLowerCase().replace(/\s+/g, "_")
  );

  try {
    // 5. Create or update database records in a transaction
    const docRecord = await prisma.$transaction(async (tx) => {
      let record;

      if (existingRecord) {
        // Update existing record (preventing duplicates)
        record = await tx.documentRecord.update({
          where: { id: existingRecord.id },
          data: {
            filePath,
            fileName: originalFileName,
            issueDate: issueDate || null,
            expiryDate: expiryDate || null,
            uploadedAt: new Date(), // Reset upload timestamp
          },
        });
      } else {
        // Create new record
        record = await tx.documentRecord.create({
          data: {
            ownerId,
            documentTypeId,
            filePath,
            fileName: originalFileName,
            issueDate: issueDate || null,
            expiryDate: expiryDate || null,
          },
        });
      }

      // Create a new PENDING Verification History entry (State Machine)
      await tx.verificationHistory.create({
        data: {
          documentRecordId: record.id,
          status: VerificationStatus.PENDING,
          step: 1,
          reviewerRole: Role.HR_ADMIN,
        },
      });

      return record;
    });

    // 6. Clean up old physical file if transaction succeeded
    if (oldFilePath) {
      await storage.delete(oldFilePath).catch((err) => {
        console.error("Gagal menghapus berkas lama:", err);
      });
    }

    return docRecord;
  } catch (error) {
    // If database fails, delete uploaded file to keep storage clean
    await storage.delete(filePath);
    throw error;
  }
}

export async function getEmployeeDocuments(ownerId: string) {
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    include: { employeePosition: true },
  });
  const userPositionName = user?.employeePosition?.name || null;

  const documents = await prisma.documentRecord.findMany({
    where: { ownerId },
    include: {
      documentType: true,
      verificationHistory: {
        orderBy: [{ step: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
    orderBy: { uploadedAt: "desc" },
  });

  const filtered = documents.filter((doc) => {
    const targetPositions = doc.documentType.targetPositions;
    if (!targetPositions) return true;
    if (!userPositionName) return false;
    const allowed = targetPositions.split(",").map((p) => p.trim());
    return allowed.includes(userPositionName);
  });

  return filtered.map((doc) => {
    const latestVerification = doc.verificationHistory[0] || null;
    return {
      ...doc,
      latestVerification,
      status: latestVerification ? latestVerification.status : "PENDING",
    };
  });
}

export async function getDocumentDetails(id: string) {
  const doc = await prisma.documentRecord.findUnique({
    where: { id },
    include: {
      documentType: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
        },
      },
      verificationHistory: {
        orderBy: [{ step: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!doc) return null;

  const latestVerification = doc.verificationHistory[0] || null;
  return {
    ...doc,
    latestVerification,
    status: latestVerification ? latestVerification.status : "PENDING",
  };
}

export async function getDocumentsForAdmin(filters: {
  status?: string;
  expiryStatus?: string;
  search?: string;
}) {
  const { status, expiryStatus, search } = filters;
  const warningDays = 30; // Expiry warn threshold
  const now = new Date();

  // Fetch all documents with their latest verification history
  const documents = await prisma.documentRecord.findMany({
    where: search
      ? {
        owner: {
          name: {
            contains: search,
          },
        },
      }
      : {},
    include: {
      documentType: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
        },
      },
      verificationHistory: {
        orderBy: [{ step: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
    orderBy: { uploadedAt: "desc" },
  });

  // Map and filter in memory
  let mappedDocs = documents.map((doc) => {
    const latestVerification = doc.verificationHistory[0] || null;
    const currentStatus = latestVerification
      ? latestVerification.status
      : "PENDING";

    // Calculate expiry status
    let currentExpiryStatus = "AMAN";
    let daysRemaining = null;

    if (doc.expiryDate) {
      const expiryTime = new Date(doc.expiryDate).getTime();
      const nowTime = now.getTime();
      const diffDays = Math.ceil((expiryTime - nowTime) / (1000 * 60 * 60 * 24));

      daysRemaining = diffDays;

      if (diffDays < 0) {
        currentExpiryStatus = "KEDALUWARSA";
      } else if (diffDays <= warningDays) {
        currentExpiryStatus = "MENDEKATI_KEDALUWARSA";
      } else {
        currentExpiryStatus = "AMAN";
      }
    }

    return {
      ...doc,
      latestVerification,
      status: currentStatus,
      expiryStatus: currentExpiryStatus,
      daysRemaining,
    };
  });

  // Apply verification status filter
  if (status && status !== "ALL") {
    mappedDocs = mappedDocs.filter(
      (doc) => doc.status.toUpperCase() === status.toUpperCase()
    );
  }

  // Apply expiry status filter
  if (expiryStatus && expiryStatus !== "ALL") {
    mappedDocs = mappedDocs.filter(
      (doc) => doc.expiryStatus.toUpperCase() === expiryStatus.toUpperCase()
    );
  }

  return mappedDocs;
}
