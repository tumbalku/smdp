import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPaginatedUsers, createUser, updateUser, getUserByEmail } from "@/services/userService";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";
import { EventType, Role, LogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createUserSchema, updateUserSchema } from "@/lib/validations/userValidation";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "ALL";

  try {
    const result = await getPaginatedUsers({
      page,
      pageSize,
      search,
      roleFilter,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[Users API GET] Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Gagal mengambil data user.";
    return NextResponse.json({ error: { message: errorMsg } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const ip = getClientIp(req);

  if (!session || !session.user) {
    logSecurityEvent({
      actorName: "Unauthenticated",
      actorRole: "Unauthenticated",
      actorId: null,
      eventType: EventType.USER_CREATED,
      resource: "New User Registration",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Belum login." },
    });
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.UNAUTHORIZED_ACCESS,
      resource: "Create User Endpoint",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Akses ditolak: Peran tidak sah." },
    });
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const dataToParse = {
      ...body,
      roles: body.roles || (body.role ? [body.role] : ["EMPLOYEE"]),
    };

    const parsed = createUserSchema.safeParse(dataToParse);
    if (!parsed.success) {
      const errMsg = parsed.error.errors.map((e) => e.message).join(", ");
      logSecurityEvent({
        actorName: session.user.name || "Admin/Staff",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_CREATED,
        resource: body.email || "Missing Email",
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: errMsg },
      });
      return NextResponse.json({ error: { message: errMsg } }, { status: 400 });
    }

    const {
      name,
      email,
      password,
      roles: selectedRoles,
      employeeId,
      gender,
      birthDate,
      employmentStatusId,
      employeeGroupId,
      professionGroupId,
      employeePositionId,
      employeeRankId,
      workplaceId,
      agama,
      pendidikanTerakhir,
      statusPernikahan,
    } = parsed.data;

    // Check email uniqueness
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logSecurityEvent({
        actorName: session.user.name || "Admin/Staff",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_CREATED,
        resource: email,
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: "Email sudah terdaftar." },
      });
      return NextResponse.json({ error: { message: "Email sudah terdaftar." } }, { status: 400 });
    }

    // Check employeeId uniqueness if provided
    if (employeeId) {
      const existingEmployee = await prisma.user.findUnique({
        where: { employeeId },
      });
      if (existingEmployee) {
        logSecurityEvent({
          actorName: session.user.name || "Admin/Staff",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.USER_CREATED,
          resource: email,
          ipAddress: ip,
          status: LogStatus.FAILED,
          metadata: { error: "NIP (Employee ID) sudah terdaftar." },
        });
        return NextResponse.json({ error: { message: "NIP (Employee ID) sudah terdaftar." } }, { status: 400 });
      }
    }

    const newUser = await createUser({
      name,
      email,
      passwordPlain: password,
      roles: selectedRoles,
      employeeId: employeeId || null,
      gender: gender || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      employmentStatusId: employmentStatusId || null,
      employeeGroupId: employeeGroupId || null,
      professionGroupId: professionGroupId || null,
      employeePositionId: employeePositionId || null,
      employeeRankId: employeeRankId || null,
      workplaceId: workplaceId || null,
      agama: agama || null,
      pendidikanTerakhir: pendidikanTerakhir || null,
      statusPernikahan: statusPernikahan || null,
    });

    // Log security event (Success)
    await logSecurityEvent({
      actorName: session.user.name || "Admin/Staff",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.USER_CREATED,
      resource: `USER-${newUser.id}`,
      ipAddress: ip,
      metadata: {
        createdUserEmail: newUser.email,
        createdUserRoles: newUser.roles,
      },
    });

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (err: unknown) {
    console.error("[Users API POST] Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    logSecurityEvent({
      actorName: session?.user?.name || "Admin/Staff",
      actorRole: session?.user?.role || "HR_ADMIN",
      actorId: session?.user?.id || null,
      eventType: EventType.USER_CREATED,
      resource: "Unexpected Catch Error",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: errorMsg },
    });
    return NextResponse.json({ error: { message: errorMsg } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const ip = getClientIp(req);

  if (!session || !session.user) {
    logSecurityEvent({
      actorName: "Unauthenticated",
      actorRole: "Unauthenticated",
      actorId: null,
      eventType: EventType.USER_ROLE_UPDATED,
      resource: "Unknown User Role Edit",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Belum login." },
    });
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.UNAUTHORIZED_ACCESS,
      resource: "Update User Role Endpoint",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Akses ditolak: Peran tidak sah." },
    });
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      const errMsg = parsed.error.errors.map((e) => e.message).join(", ");
      logSecurityEvent({
        actorName: session.user.name || "Admin/Staff",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_ROLE_UPDATED,
        resource: body.id ? `USER-${body.id}` : "Missing ID",
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: errMsg },
      });
      return NextResponse.json({ error: { message: errMsg } }, { status: 400 });
    }

    const {
      id,
      name,
      email,
      employeeId,
      gender,
      birthDate,
      roles,
      employmentStatusId,
      employeeGroupId,
      professionGroupId,
      employeePositionId,
      employeeRankId,
      workplaceId,
      agama,
      pendidikanTerakhir,
      statusPernikahan,
    } = parsed.data;

    const oldUser = await prisma.user.findUnique({
      where: { id },
      include: { roles: { select: { role: true } } }
    });
    if (!oldUser) {
      logSecurityEvent({
        actorName: session.user.name || "Admin/Staff",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_ROLE_UPDATED,
        resource: `USER-${id}`,
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: "User tidak ditemukan." },
      });
      return NextResponse.json({ error: { message: "User tidak ditemukan." } }, { status: 404 });
    }

    // Check email uniqueness if it is changing
    if (email && email !== oldUser.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        logSecurityEvent({
          actorName: session.user.name || "Admin/Staff",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.USER_UPDATED,
          resource: `USER-${id}`,
          ipAddress: ip,
          status: LogStatus.FAILED,
          metadata: { error: "Email sudah terdaftar pada pegawai lain." },
        });
        return NextResponse.json({ error: { message: "Email sudah terdaftar pada pegawai lain." } }, { status: 400 });
      }
    }

    // Check NIP uniqueness if it is changing
    if (employeeId && employeeId !== oldUser.employeeId) {
      const existingEmployee = await prisma.user.findUnique({ where: { employeeId } });
      if (existingEmployee) {
        logSecurityEvent({
          actorName: session.user.name || "Admin/Staff",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.USER_UPDATED,
          resource: `USER-${id}`,
          ipAddress: ip,
          status: LogStatus.FAILED,
          metadata: { error: "NIP sudah terdaftar pada pegawai lain." },
        });
        return NextResponse.json({ error: { message: "NIP sudah terdaftar pada pegawai lain." } }, { status: 400 });
      }
    }

    const oldRoles = oldUser.roles.map(r => r.role);
    if (oldRoles.length === 0) oldRoles.push(oldUser.role);

    // Call unified updateUser instead of updateUserRoles
    const updatedUser = await updateUser(id, {
      name,
      email,
      employeeId: employeeId || null,
      gender: gender || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      roles: roles as Role[] | undefined,
      employmentStatusId: employmentStatusId || null,
      employeeGroupId: employeeGroupId || null,
      professionGroupId: professionGroupId || null,
      employeePositionId: employeePositionId || null,
      employeeRankId: employeeRankId || null,
      workplaceId: workplaceId || null,
      agama: agama || null,
      pendidikanTerakhir: pendidikanTerakhir || null,
      statusPernikahan: statusPernikahan || null,
    });

    // Log success
    await logSecurityEvent({
      actorName: session.user.name || "Admin/Staff",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.USER_ROLE_UPDATED,
      resource: `USER-${id}`,
      ipAddress: ip,
      metadata: {
        targetUserEmail: updatedUser.email,
        oldRoles: oldRoles,
        newRoles: updatedUser.roles,
        updatedFields: Object.keys(body).filter(k => k !== "id"),
      },
    });

    return NextResponse.json({ data: updatedUser });
  } catch (err: unknown) {
    console.error("[Users API PATCH] Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    logSecurityEvent({
      actorName: session?.user?.name || "Admin/Staff",
      actorRole: session?.user?.role || "HR_ADMIN",
      actorId: session?.user?.id || null,
      eventType: EventType.USER_ROLE_UPDATED,
      resource: "Unexpected Catch Error",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: errorMsg },
    });
    return NextResponse.json({ error: { message: errorMsg } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const ip = getClientIp(req);

  if (!session || !session.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: { message: "ID parameter is required" } }, { status: 400 });
  }

  if (session.user.id === id) {
    return NextResponse.json({ error: { message: "Anda tidak dapat menghapus akun Anda sendiri." } }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: { message: "User tidak ditemukan." } }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Set reviewedById to null in VerificationHistory
      await tx.verificationHistory.updateMany({
        where: { reviewedById: id },
        data: { reviewedById: null },
      });

      // 2. Set actorId to null in SecurityLog
      await tx.securityLog.updateMany({
        where: { actorId: id },
        data: { actorId: null },
      });

      // 3. UserRole has Cascade deletion, but we can explicitly clean it
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      // 4. Finally, delete the User
      await tx.user.delete({
        where: { id },
      });
    });

    logSecurityEvent({
      actorName: session.user.name || "Admin/Staff",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.USER_UPDATED,
      resource: `USER-${id}`,
      ipAddress: ip,
      status: LogStatus.SUCCESS,
      metadata: { action: "DELETE_USER", deletedUserEmail: targetUser.email },
    });

    return NextResponse.json({ message: "Pegawai berhasil dihapus." });
  } catch (err: unknown) {
    console.error("[Users API DELETE] Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    logSecurityEvent({
      actorName: session?.user?.name || "Admin/Staff",
      actorRole: session?.user?.role || "HR_ADMIN",
      actorId: session?.user?.id || null,
      eventType: EventType.USER_UPDATED,
      resource: `USER-${id}`,
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: errorMsg },
    });
    return NextResponse.json({ error: { message: errorMsg } }, { status: 500 });
  }
}
