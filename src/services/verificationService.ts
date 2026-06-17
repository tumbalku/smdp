import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";

export interface VerifyDocumentInput {
  documentRecordId: string;
  reviewerId: string;
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

export async function verifyDocument(input: VerifyDocumentInput) {
  const { documentRecordId, reviewerId, status, reviewNote } = input;

  if (status !== "APPROVED" && status !== "REJECTED") {
    throw new Error("Status verifikasi tidak valid.");
  }

  // 1. If rejected, validate review note (required and min 10 chars)
  if (status === "REJECTED") {
    if (!reviewNote || reviewNote.trim().length < 10) {
      throw new Error(
        "Catatan revisi wajib diisi dengan minimal 10 karakter saat menolak dokumen."
      );
    }
  }

  // 2. Verify the reviewer exists in the database
  const reviewer = await prisma.user.findUnique({
    where: { id: reviewerId },
    select: { id: true },
  });

  if (!reviewer) {
    throw new Error(
      "Sesi pengguna tidak valid atau telah kedaluwarsa. Silakan logout dan login kembali."
    );
  }

  // 3. Find the latest PENDING verification history entry
  const pendingHistory = await prisma.verificationHistory.findFirst({
    where: {
      documentRecordId,
      status: VerificationStatus.PENDING,
    },
    orderBy: [{ step: "desc" }, { createdAt: "desc" }],
  });

  if (!pendingHistory) {
    throw new Error("Tidak ada verifikasi pending untuk dokumen ini.");
  }

  // 4. Update the entry
  const updatedHistory = await prisma.verificationHistory.update({
    where: { id: pendingHistory.id },
    data: {
      status:
        status === "APPROVED"
          ? VerificationStatus.APPROVED
          : VerificationStatus.REJECTED,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      reviewNote: status === "REJECTED" ? reviewNote : null,
    },
  });

  return updatedHistory;
}
