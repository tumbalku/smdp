import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resetUserPassword } from "@/services/userService";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";
import { EventType, LogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const ip = getClientIp(req);
  const { id } = await params;

  // Only HR_ADMIN can reset passwords
  if (!session?.user) {
    logSecurityEvent({
      actorName: "Unauthenticated",
      actorRole: "Unauthenticated",
      actorId: null,
      eventType: EventType.USER_UPDATED,
      resource: `USER-${id} Password Reset`,
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Belum login." },
    });
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  if (session.user.role !== "HR_ADMIN") {
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.UNAUTHORIZED_ACCESS,
      resource: `USER-${id} Password Reset`,
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Akses ditolak: Hanya HR Admin yang dapat mengubah password pegawai." },
    });
    return NextResponse.json(
      { error: { message: "Forbidden: Hanya HR Admin yang dapat mengubah password pegawai." } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      logSecurityEvent({
        actorName: session.user.name || "Admin",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_UPDATED,
        resource: `USER-${id} Password Reset`,
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: "Password baru minimal 6 karakter." },
      });
      return NextResponse.json(
        { error: { message: "Password baru minimal 6 karakter." } },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      logSecurityEvent({
        actorName: session.user.name || "Admin",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_UPDATED,
        resource: `USER-${id} Password Reset`,
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: "Pegawai tidak ditemukan." },
      });
      return NextResponse.json({ error: { message: "Pegawai tidak ditemukan." } }, { status: 404 });
    }

    // Prevent admin from accidentally resetting own password via this endpoint
    // (they can still do it, just log it clearly)
    const isSelf = session.user.id === id;

    await resetUserPassword(id, newPassword);

    await logSecurityEvent({
      actorName: session.user.name || "Admin",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.USER_UPDATED,
      resource: `USER-${id}`,
      ipAddress: ip,
      status: LogStatus.SUCCESS,
      metadata: {
        action: "PASSWORD_RESET",
        targetUserEmail: targetUser.email,
        targetUserName: targetUser.name,
        isSelfReset: isSelf,
      },
    });

    return NextResponse.json({
      data: { message: `Password untuk "${targetUser.name}" berhasil diperbarui.` },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[Password Reset API] Error:", err);
    logSecurityEvent({
      actorName: session.user.name || "Admin",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.USER_UPDATED,
      resource: `USER-${id} Password Reset`,
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: errorMsg },
    });
    return NextResponse.json({ error: { message: errorMsg } }, { status: 500 });
  }
}
