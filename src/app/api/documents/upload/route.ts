import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadDocument } from "@/services/documentService";
import { Role, EventType, LogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      logSecurityEvent({
        actorName: "Unauthenticated",
        actorRole: "Unauthenticated",
        actorId: null,
        eventType: EventType.DOCUMENT_UPLOADED,
        resource: "Unknown Document Upload",
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Belum login." },
      });
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Belum login." } },
        { status: 401 }
      );
    }

    const userRoles = session.user.roles || [session.user.role];

    if (!userRoles.includes(Role.EMPLOYEE)) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.UNAUTHORIZED_ACCESS,
        resource: "Upload Document Endpoint",
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Hanya pegawai yang dapat mengunggah dokumen." },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "FORBIDDEN",
            message: "Hanya pegawai yang dapat mengunggah dokumen.",
          },
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentTypeId = formData.get("documentTypeId") as string | null;
    const issueDateStr = formData.get("issueDate") as string | null;
    const expiryDateStr = formData.get("expiryDate") as string | null;

    if (!file || !documentTypeId) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_UPLOADED,
        resource: "Missing Parameters",
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "File berkas dan Jenis Dokumen wajib diisi." },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "File berkas dan Jenis Dokumen wajib diisi.",
          },
        },
        { status: 400 }
      );
    }

    // Query DocumentType details for validation
    const docType = await prisma.documentType.findUnique({
      where: { id: documentTypeId },
    });

    if (!docType) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_UPLOADED,
        resource: `Type-${documentTypeId}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Jenis dokumen tidak ditemukan." },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Jenis dokumen tidak ditemukan.",
          },
        },
        { status: 400 }
      );
    }

    // Validate target positions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employeePosition: true, professionGroup: true },
    });
    const userPositionName = user?.employeePosition?.name || null;
    const userProfName = user?.professionGroup?.name || null;

    if (docType.targetPositions) {
      const allowed = docType.targetPositions.split(",").map((p) => p.trim());
      const isPositionAllowed = (userPositionName && allowed.includes(userPositionName)) || (userProfName && allowed.includes(userProfName));
      if (!isPositionAllowed) {
        const currentLabel = userProfName || userPositionName || "-";
        logSecurityEvent({
          actorName: session.user.name || session.user.email || "Unknown",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.UNAUTHORIZED_ACCESS,
          resource: `Upload-${docType.name}`,
          ipAddress: getClientIp(req as unknown as Request),
          status: LogStatus.FAILED,
          metadata: { error: `Pegawai posisi/kelompok "${currentLabel}" tidak memiliki wewenang untuk mengunggah dokumen "${docType.name}".` },
        });
        return NextResponse.json(
          {
            data: null,
            error: {
              code: "FORBIDDEN",
              message: `Posisi/Kelompok Anda (${currentLabel}) tidak memiliki wewenang untuk mengunggah dokumen "${docType.name}".`,
            },
          },
          { status: 403 }
        );
      }
    }

    // Validate size
    const maxSizeMB = docType.maxSize ?? 5;
    const sizeLimit = maxSizeMB * 1024 * 1024;
    if (file.size > sizeLimit) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_UPLOADED,
        resource: `${docType.name}-${file.name}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: `Ukuran file melebihi batas maksimum ${maxSizeMB}MB.` },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: `Ukuran file melebihi batas maksimum ${maxSizeMB}MB.`,
          },
        },
        { status: 400 }
      );
    }

    // Validate type
    const allowedFormatsStr = docType.allowedFormats ?? "PDF, JPG, PNG";
    const allowedExts = allowedFormatsStr
      .split(",")
      .map((f) => f.trim().toLowerCase());

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

    const mimeMap: Record<string, string[]> = {
      pdf: ["application/pdf"],
      jpg: ["image/jpeg", "image/jpg", "image/pjpeg"],
      jpeg: ["image/jpeg", "image/jpg", "image/pjpeg"],
      png: ["image/png"],
      docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      doc: ["application/msword"],
      xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      xls: ["application/vnd.ms-excel"],
      zip: ["application/zip", "application/x-zip-compressed"],
    };

    const isAllowed = allowedExts.some((ext) => {
      if (ext === fileExt) return true;
      if ((ext === "jpg" || ext === "jpeg") && (fileExt === "jpg" || fileExt === "jpeg")) return true;
      const mimes = mimeMap[ext];
      if (mimes && mimes.includes(file.type)) return true;
      return false;
    });

    if (!isAllowed) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_UPLOADED,
        resource: `${docType.name}-${file.name}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: `Format file tidak didukung. Gunakan ${allowedFormatsStr}.` },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: `Format file tidak didukung. Gunakan ${allowedFormatsStr}.`,
          },
        },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const issueDate = issueDateStr ? new Date(issueDateStr) : undefined;
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : undefined;

    // Validate required dates based on document type config
    if (docType.requiresExpiryDate && !issueDateStr) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Tanggal terbit wajib diisi untuk jenis dokumen ini.",
          },
        },
        { status: 400 }
      );
    }
    if (docType.requiresExpiryDate && !expiryDateStr) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Tanggal masa berlaku wajib diisi untuk jenis dokumen ini.",
          },
        },
        { status: 400 }
      );
    }


    const docRecord = await uploadDocument({
      ownerId: session.user.id,
      documentTypeId,
      fileBuffer,
      originalFileName: file.name,
      issueDate,
      expiryDate,
    });

    // Fire-and-forget security log
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: "Employee",
      actorId: session.user.id,
      eventType: EventType.DOCUMENT_UPLOADED,
      resource: `${docType.name}-${docRecord.id.slice(0, 8).toUpperCase()}`,
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.SUCCESS,
    });

    return NextResponse.json({ data: docRecord, error: null }, { status: 201 });
  } catch (error: unknown) {
    console.error("Upload Document Error:", error);
    const err = error as Error;
    const session = await getServerSession(authOptions).catch(() => null);
    logSecurityEvent({
      actorName: session?.user?.name || session?.user?.email || "Unknown",
      actorRole: session?.user?.role || "Unauthenticated",
      actorId: session?.user?.id || null,
      eventType: EventType.DOCUMENT_UPLOADED,
      resource: "Unexpected Error",
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.FAILED,
      metadata: { error: err.message || "Internal Server Error" },
    });
    return NextResponse.json(
      {
        data: null,
        error: { code: "BAD_REQUEST", message: err.message },
      },
      { status: 400 }
    );
  }
}
