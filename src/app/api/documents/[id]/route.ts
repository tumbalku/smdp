import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDocumentDetails } from "@/services/documentService";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import { Role, EventType, LogStatus } from "@prisma/client";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Belum login." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const document = await getDocumentDetails(id);

    if (!document) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Dokumen tidak ditemukan.",
          },
        },
        { status: 404 }
      );
    }

    // Access check: Owner can view, Admin/Staff can view
    if (
      session.user.role !== Role.HR_ADMIN &&
      session.user.role !== Role.STAFF &&
      document.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { data: null, error: { code: "FORBIDDEN", message: "Akses ditolak." } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: document, error: null });
  } catch (error: unknown) {
    console.error("GET Single Document Error:", error);
    const err = error as Error;
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: err.message || "Terjadi kesalahan server." },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      logSecurityEvent({
        actorName: "Unauthenticated",
        actorRole: "Unauthenticated",
        actorId: null,
        eventType: EventType.DOCUMENT_DELETED,
        resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Belum login." },
      });
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Belum login." } },
        { status: 401 }
      );
    }

    const document = await prisma.documentRecord.findUnique({
      where: { id },
    });

    if (!document) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_DELETED,
        resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Dokumen tidak ditemukan." },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Dokumen tidak ditemukan.",
          },
        },
        { status: 404 }
      );
    }

    // Access check: Only owner of the document can delete it
    if (document.ownerId !== session.user.id) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_DELETED,
        resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Hanya pemilik dokumen yang dapat menghapus." },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "FORBIDDEN",
            message: "Hanya pemilik dokumen yang dapat menghapus.",
          },
        },
        { status: 403 }
      );
    }

    // Delete file from disk
    const storage = getStorageProvider();
    await storage.delete(document.filePath);

    // Delete from DB (onDelete Cascade will delete verification history)
    await prisma.documentRecord.delete({
      where: { id },
    });

    // Log success
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.DOCUMENT_DELETED,
      resource: `${document.fileName}-${id.slice(0, 8).toUpperCase()}`,
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.SUCCESS,
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: unknown) {
    console.error("DELETE Document Error:", error);
    const err = error as Error;
    const session = await getServerSession(authOptions).catch(() => null);
    logSecurityEvent({
      actorName: session?.user?.name || session?.user?.email || "Unknown",
      actorRole: session?.user?.role || "Unauthenticated",
      actorId: session?.user?.id || null,
      eventType: EventType.DOCUMENT_DELETED,
      resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.FAILED,
      metadata: { error: err.message || "Internal Server Error" },
    });
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server." },
      },
      { status: 500 }
    );
  }
}
