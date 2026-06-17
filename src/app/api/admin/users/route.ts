import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPaginatedUsers, createUser, updateUser, updateUserRoles, getUserByEmail } from "@/services/userService";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";
import { EventType, Role, LogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
    const { 
      name, 
      email, 
      password, 
      role, 
      roles, 
      employeeId, 
      gender, 
      birthDate,
      employmentStatusId,
      employeeGroupId,
      employeePositionId 
    } = body;

    if (!name || !email || !password || !employeeId || !String(employeeId).trim()) {
      logSecurityEvent({
        actorName: session.user.name || "Admin/Staff",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_CREATED,
        resource: email || "Missing Email",
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: "Nama, email, password, dan NIP wajib diisi." },
      });
      return NextResponse.json({ error: { message: "Nama, email, password, dan NIP wajib diisi." } }, { status: 400 });
    }

    // Determine roles array
    let selectedRoles: Role[] = [];
    if (roles && Array.isArray(roles)) {
      selectedRoles = roles as Role[];
    } else if (role) {
      selectedRoles = [role as Role];
    } else {
      selectedRoles = [Role.EMPLOYEE];
    }

    // Check validity of roles
    for (const r of selectedRoles) {
      if (!Object.values(Role).includes(r)) {
        logSecurityEvent({
          actorName: session.user.name || "Admin/Staff",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.USER_CREATED,
          resource: email,
          ipAddress: ip,
          status: LogStatus.FAILED,
          metadata: { error: `Peran tidak valid: ${r}` },
        });
        return NextResponse.json({ error: { message: `Peran tidak valid: ${r}` } }, { status: 400 });
      }
    }

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
      employeePositionId: employeePositionId || null,
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
    const body = await req.json();
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
      employeePositionId 
    } = body;

    if (!id) {
      logSecurityEvent({
        actorName: session.user.name || "Admin/Staff",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_ROLE_UPDATED,
        resource: "Missing ID",
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: "ID pegawai wajib diisi." },
      });
      return NextResponse.json({ error: { message: "ID pegawai wajib diisi." } }, { status: 400 });
    }

    if (roles && !Array.isArray(roles)) {
      logSecurityEvent({
        actorName: session.user.name || "Admin/Staff",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.USER_ROLE_UPDATED,
        resource: `USER-${id}`,
        ipAddress: ip,
        status: LogStatus.FAILED,
        metadata: { error: "Peran harus berupa array." },
      });
      return NextResponse.json({ error: { message: "Peran harus berupa array." } }, { status: 400 });
    }

    if (roles) {
      for (const r of roles) {
        if (!Object.values(Role).includes(r)) {
          logSecurityEvent({
            actorName: session.user.name || "Admin/Staff",
            actorRole: session.user.role,
            actorId: session.user.id,
            eventType: EventType.USER_ROLE_UPDATED,
            resource: `USER-${id}`,
            ipAddress: ip,
            status: LogStatus.FAILED,
            metadata: { error: `Peran tidak valid: ${r}` },
          });
          return NextResponse.json({ error: { message: `Peran tidak valid: ${r}` } }, { status: 400 });
        }
      }
    }

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
      employeePositionId: employeePositionId || null,
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
