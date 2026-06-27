import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyDocument } from "@/services/verificationService";
import { Role, EventType, LogStatus } from "@prisma/client";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";

export async function POST(
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
        eventType: EventType.UNAUTHORIZED_ACCESS,
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

    const userRoles = session.user.roles || [session.user.role];
    const hasAdminOrStaff = userRoles.includes(Role.HR_ADMIN) || userRoles.includes(Role.STAFF);
    if (!hasAdminOrStaff) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.UNAUTHORIZED_ACCESS,
        resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Akses ditolak: Peran tidak sah." },
      });
      return NextResponse.json(
        { data: null, error: { code: "FORBIDDEN", message: "Akses ditolak." } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { status, reviewNote } = body;

    if (!status) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_APPROVED,
        resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Status verifikasi wajib diisi." },
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Status verifikasi wajib diisi.",
          },
        },
        { status: 400 }
      );
    }

    const verificationResult = await verifyDocument({
      documentRecordId: id,
      reviewerId: session.user.id,
      status,
      reviewNote,
    });

    // Fire-and-forget security log
    const isApproved = status === "APPROVED";
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: isApproved ? EventType.DOCUMENT_APPROVED : EventType.DOCUMENT_REJECTED,
      resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.SUCCESS,
      metadata: reviewNote ? { reviewNote } : undefined,
    });

    return NextResponse.json({ data: verificationResult, error: null });
  } catch (error: unknown) {
    console.error("Verify Document Error:", error);
    const err = error as Error;
    const session = await getServerSession(authOptions).catch(() => null);
    logSecurityEvent({
      actorName: session?.user?.name || session?.user?.email || "Unknown",
      actorRole: session?.user?.role || "Unauthenticated",
      actorId: session?.user?.id || null,
      eventType: EventType.DOCUMENT_APPROVED,
      resource: `DOC-${id.slice(0, 8).toUpperCase()}`,
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.FAILED,
      metadata: { error: err.message || "Internal Server Error" },
    });
    const isSessionError = err.message?.includes("Sesi pengguna tidak valid");
    return NextResponse.json(
      {
        data: null,
        error: {
          code: isSessionError ? "UNAUTHORIZED" : "BAD_REQUEST",
          message: err.message,
        },
      },
      { status: isSessionError ? 401 : 400 }
    );
  }
}
