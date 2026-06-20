import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, Prisma } from "@prisma/client";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      employeeId: true,
      createdAt: true,
      namaLahir: true,
      alamatLengkap: true,
      nomorTelepon: true,
      gelarAkademik: true,
      gender: true,
      birthDate: true,
      employmentStatusId: true,
      employeeGroupId: true,
      employeePositionId: true,
      employmentStatus: { select: { id: true, name: true } },
      employeeGroup: { select: { id: true, name: true } },
      employeePosition: { select: { id: true, name: true } },
      roles: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!user) return null;

  const mappedRoles = user.roles.map((r) => r.role);
  if (mappedRoles.length === 0) mappedRoles.push(user.role);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { roles, ...userWithoutRelation } = user;
  return {
    ...userWithoutRelation,
    roles: mappedRoles,
  };
}

export async function updateUserProfile(
  id: string,
  data: {
    namaLahir?: string;
    alamatLengkap?: string;
    nomorTelepon?: string;
    gelarAkademik?: string;
    gender?: string;
    birthDate?: Date;
  }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      employeeId: true,
      createdAt: true,
      namaLahir: true,
      alamatLengkap: true,
      nomorTelepon: true,
      gelarAkademik: true,
      gender: true,
      birthDate: true,
    },
  });
}

export async function resetUserPassword(id: string, newPasswordPlain: string) {
  const passwordHash = await bcrypt.hash(newPasswordPlain, 10);
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
    select: { id: true, email: true, name: true },
  });
}


export async function verifyCredentials(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const mappedRoles = user.roles.map((r) => r.role);
  if (mappedRoles.length === 0) mappedRoles.push(user.role);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, roles, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    roles: mappedRoles,
  };
}

function getHighestRole(roles: Role[]): Role {
  if (roles.includes(Role.HR_ADMIN)) return Role.HR_ADMIN;
  if (roles.includes(Role.STAFF)) return Role.STAFF;
  return Role.EMPLOYEE;
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordPlain: string;
  roles?: Role[];
  employeeId?: string | null;
  gender?: string | null;
  birthDate?: Date | null;
  employmentStatusId?: string | null;
  employeeGroupId?: string | null;
  employeePositionId?: string | null;
}) {
  const passwordHash = await bcrypt.hash(data.passwordPlain, 10);
  const selectedRoles = data.roles && data.roles.length > 0 ? data.roles : [Role.EMPLOYEE];
  const primaryRole = getHighestRole(selectedRoles);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: primaryRole,
        employeeId: data.employeeId || null,
        gender: data.gender || null,
        birthDate: data.birthDate || null,
        employmentStatusId: data.employmentStatusId || null,
        employeeGroupId: data.employeeGroupId || null,
        employeePositionId: data.employeePositionId || null,
      },
    });

    await tx.userRole.createMany({
      data: selectedRoles.map((r) => ({
        userId: user.id,
        role: r,
      })),
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roles: selectedRoles,
      employeeId: user.employeeId,
      createdAt: user.createdAt,
      gender: user.gender,
      birthDate: user.birthDate,
      employmentStatusId: user.employmentStatusId,
      employeeGroupId: user.employeeGroupId,
      employeePositionId: user.employeePositionId,
    };
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    employeeId?: string | null;
    gender?: string | null;
    birthDate?: Date | null;
    roles?: Role[];
    employmentStatusId?: string | null;
    employeeGroupId?: string | null;
    employeePositionId?: string | null;
  }
) {
  const selectedRoles = data.roles && data.roles.length > 0 ? data.roles : undefined;
  const primaryRole = selectedRoles ? getHighestRole(selectedRoles) : undefined;

  return prisma.$transaction(async (tx) => {
    // 1. Update User fields
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        employeeId: data.employeeId,
        gender: data.gender,
        birthDate: data.birthDate,
        role: primaryRole,
        employmentStatusId: data.employmentStatusId,
        employeeGroupId: data.employeeGroupId,
        employeePositionId: data.employeePositionId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeId: true,
        createdAt: true,
        namaLahir: true,
        alamatLengkap: true,
        nomorTelepon: true,
        gelarAkademik: true,
        gender: true,
        birthDate: true,
        employmentStatusId: true,
        employeeGroupId: true,
        employeePositionId: true,
        employmentStatus: { select: { id: true, name: true } },
        employeeGroup: { select: { id: true, name: true } },
        employeePosition: { select: { id: true, name: true } },
      },
    });

    // 2. If roles are provided, update user roles table
    if (selectedRoles) {
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      await tx.userRole.createMany({
        data: selectedRoles.map((r) => ({
          userId: id,
          role: r,
        })),
      });
    }

    // Fetch updated roles to return
    const userRoles = await tx.userRole.findMany({
      where: { userId: id },
      select: { role: true },
    });
    const mappedRoles = userRoles.map((r) => r.role);
    if (mappedRoles.length === 0) mappedRoles.push(updatedUser.role);

    return {
      ...updatedUser,
      roles: mappedRoles,
    };
  });
}

export async function updateUserRoles(id: string, roles: Role[]) {
  return updateUser(id, { roles });
}

export async function getPaginatedUsers(params: {
  page: number;
  pageSize: number;
  search?: string;
  roleFilter?: string;
}) {
  const { page, pageSize, search, roleFilter } = params;
  const where: Prisma.UserWhereInput = {};

  if (roleFilter && roleFilter !== "ALL") {
    where.OR = [
      { role: roleFilter as Role },
      { roles: { some: { role: roleFilter as Role } } },
    ];
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { employeeId: { contains: search } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeId: true,
        createdAt: true,
        namaLahir: true,
        alamatLengkap: true,
        nomorTelepon: true,
        gelarAkademik: true,
        gender: true,
        birthDate: true,
        employmentStatusId: true,
        employeeGroupId: true,
        employeePositionId: true,
        employmentStatus: { select: { id: true, name: true } },
        employeeGroup: { select: { id: true, name: true } },
        employeePosition: { select: { id: true, name: true } },
        roles: {
          select: {
            role: true,
          },
        },
      },
    }),
  ]);

  const mappedUsers = users.map((u) => {
    const mappedRoles = u.roles.map((r) => r.role);
    if (mappedRoles.length === 0) mappedRoles.push(u.role);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roles, ...userWithoutRelation } = u;
    return {
      ...userWithoutRelation,
      roles: mappedRoles,
    };
  });

  return {
    users: mappedUsers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
