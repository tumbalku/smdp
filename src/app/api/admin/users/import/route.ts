import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";
import { EventType, Role, LogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = "";
      } else if (char === '\n' || char === '\r') {
        row.push(cell);
        cell = "";
        // Handle CRLF
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        if (row.length > 1 || row[0] !== "") {
          lines.push(row);
        }
        row = [];
      } else {
        cell += char;
      }
    }
  }

  // Handle final cell / row if file didn't end with a newline
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    lines.push(row);
  }

  return lines;
}

function getHighestRole(roles: Role[]): Role {
  if (roles.includes(Role.HR_ADMIN)) return Role.HR_ADMIN;
  if (roles.includes(Role.STAFF)) return Role.STAFF;
  return Role.EMPLOYEE;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const ip = getClientIp(req);

  if (!session?.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.UNAUTHORIZED_ACCESS,
      resource: "Import Users Endpoint",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Akses ditolak: Peran tidak sah." },
    });
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const formData = await req.formData().catch(() => null);
    const file = formData?.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: { message: "Berkas tidak ditemukan." } }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length <= 1) {
      return NextResponse.json({ error: { message: "Berkas CSV kosong atau hanya berisi baris header." } }, { status: 400 });
    }

    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const nameIdx = headers.indexOf("nama");
    const nipIdx = headers.indexOf("nip");
    const emailIdx = headers.indexOf("email");
    const genderIdx = headers.indexOf("gender");
    const birthDateIdx = headers.indexOf("tanggal_lahir");
    const statusIdx = headers.indexOf("status_kepegawaian");
    const groupIdx = headers.indexOf("jenis_kepegawaian");
    const professionIdx = headers.indexOf("kelompok_profesi");
    const positionIdx = headers.indexOf("jabatan");
    const rankIdx = headers.indexOf("pangkat");
    const rolesIdx = headers.indexOf("peran");

    if (nameIdx === -1 || nipIdx === -1 || emailIdx === -1) {
      return NextResponse.json({
        error: {
          message: "Format CSV tidak valid. Kolom 'nama', 'nip', dan 'email' wajib ada.",
        },
      }, { status: 400 });
    }

    // Pre-fetch all taxonomy tables for lookups
    const statuses = await prisma.employmentStatus.findMany({
      include: { groups: true },
    });
    const professions = await prisma.professionGroup.findMany({
      include: { positions: true },
    });
    const ranks = await prisma.employeeRank.findMany();

    const statusMap = new Map<string, { id: string; groups: Map<string, string> }>();
    for (const s of statuses) {
      const groupMap = new Map<string, string>();
      for (const g of s.groups) {
        groupMap.set(g.name.toLowerCase().trim(), g.id);
      }
      statusMap.set(s.name.toLowerCase().trim(), { id: s.id, groups: groupMap });
    }

    const professionMap = new Map<string, { id: string; positions: Map<string, string> }>();
    for (const p of professions) {
      const positionMap = new Map<string, string>();
      for (const pos of p.positions) {
        positionMap.set(pos.name.toLowerCase().trim(), pos.id);
      }
      professionMap.set(p.name.toLowerCase().trim(), { id: p.id, positions: positionMap });
    }

    const rankMap = new Map<string, string>();
    for (const r of ranks) {
      rankMap.set(r.name.toLowerCase().trim(), r.id);
    }

    // Pre-fetch existing users to check for email / employeeId duplicates
    const existingUsers = await prisma.user.findMany({
      select: {
        email: true,
        employeeId: true,
      },
    });

    const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase().trim()));
    const existingNips = new Set(
      existingUsers.map((u) => u.employeeId?.toLowerCase().trim()).filter(Boolean) as string[]
    );

    const defaultPasswordHash = await bcrypt.hash("pegawai123", 10);

    const importedUsers: any[] = [];
    const errors: { row: number; nip?: string; email?: string; message: string }[] = [];

    const csvEmails = new Set<string>();
    const csvNips = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || (row.length === 1 && row[0] === "")) {
        continue;
      }

      const rowNum = i + 1;

      // Extract raw values
      const rawName = row[nameIdx]?.trim() || "";
      const rawNip = row[nipIdx]?.trim() || "";
      const rawEmail = row[emailIdx]?.trim() || "";
      const rawGender = genderIdx !== -1 ? row[genderIdx]?.trim() : "";
      const rawBirthDate = birthDateIdx !== -1 ? row[birthDateIdx]?.trim() : "";
      const rawStatus = statusIdx !== -1 ? row[statusIdx]?.trim() : "";
      const rawGroup = groupIdx !== -1 ? row[groupIdx]?.trim() : "";
      const rawProfession = professionIdx !== -1 ? row[professionIdx]?.trim() : "";
      const rawPosition = positionIdx !== -1 ? row[positionIdx]?.trim() : "";
      const rawRank = rankIdx !== -1 ? row[rankIdx]?.trim() : "";
      const rawRoles = rolesIdx !== -1 ? row[rolesIdx]?.trim() : "";

      // Validations
      if (!rawName) {
        errors.push({ row: rowNum, message: "Nama wajib diisi." });
        continue;
      }
      if (!rawNip) {
        errors.push({ row: rowNum, message: "NIP wajib diisi." });
        continue;
      }
      if (!rawEmail) {
        errors.push({ row: rowNum, message: "Email wajib diisi." });
        continue;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail)) {
        errors.push({ row: rowNum, email: rawEmail, message: "Format email tidak valid." });
        continue;
      }

      let gender: "L" | "P" | null = null;
      if (rawGender) {
        const upperGender = rawGender.toUpperCase();
        if (upperGender === "L" || upperGender === "P") {
          gender = upperGender;
        } else {
          errors.push({ row: rowNum, message: "Gender harus berupa 'L' atau 'P'." });
          continue;
        }
      }

      let birthDate: Date | null = null;
      if (rawBirthDate) {
        const parsedDate = new Date(rawBirthDate);
        if (isNaN(parsedDate.getTime())) {
          errors.push({ row: rowNum, message: "Format tanggal lahir tidak valid (gunakan YYYY-MM-DD)." });
          continue;
        }
        birthDate = parsedDate;
      }

      const lowerEmail = rawEmail.toLowerCase();
      const lowerNip = rawNip.toLowerCase();

      if (csvEmails.has(lowerEmail)) {
        errors.push({ row: rowNum, email: rawEmail, message: `Email '${rawEmail}' duplikat di dalam berkas CSV.` });
        continue;
      }
      if (csvNips.has(lowerNip)) {
        errors.push({ row: rowNum, nip: rawNip, message: `NIP '${rawNip}' duplikat di dalam berkas CSV.` });
        continue;
      }

      if (existingEmails.has(lowerEmail)) {
        errors.push({ row: rowNum, email: rawEmail, message: `Email '${rawEmail}' sudah terdaftar di sistem.` });
        continue;
      }
      if (existingNips.has(lowerNip)) {
        errors.push({ row: rowNum, nip: rawNip, message: `NIP '${rawNip}' sudah terdaftar di sistem.` });
        continue;
      }

      csvEmails.add(lowerEmail);
      csvNips.add(lowerNip);

      let employmentStatusId: string | null = null;
      let employeeGroupId: string | null = null;
      let professionGroupId: string | null = null;
      let employeePositionId: string | null = null;

      if (rawStatus) {
        const statusData = statusMap.get(rawStatus.toLowerCase());
        if (!statusData) {
          errors.push({ row: rowNum, message: `Status kepegawaian '${rawStatus}' tidak ditemukan di database.` });
          continue;
        }
        employmentStatusId = statusData.id;

        if (rawGroup) {
          const groupId = statusData.groups.get(rawGroup.toLowerCase());
          if (!groupId) {
            errors.push({
              row: rowNum,
              message: `Jenis kepegawaian '${rawGroup}' tidak ditemukan untuk status '${rawStatus}' di database.`,
            });
            continue;
          }
          employeeGroupId = groupId;
        }
      } else if (rawGroup) {
        errors.push({ row: rowNum, message: "Tidak dapat menentukan Jenis Kepegawaian tanpa Status Kepegawaian." });
        continue;
      }

      if (rawProfession) {
        const professionData = professionMap.get(rawProfession.toLowerCase());
        if (!professionData) {
          errors.push({ row: rowNum, message: `Kelompok profesi '${rawProfession}' tidak ditemukan di database.` });
          continue;
        }
        professionGroupId = professionData.id;

        if (rawPosition) {
          const positionId = professionData.positions.get(rawPosition.toLowerCase());
          if (!positionId) {
            errors.push({
              row: rowNum,
              message: `Jabatan '${rawPosition}' tidak ditemukan untuk kelompok profesi '${rawProfession}' di database.`,
            });
            continue;
          }
          employeePositionId = positionId;
        }
      } else if (rawPosition) {
        errors.push({ row: rowNum, message: "Tidak dapat menentukan Jabatan tanpa Kelompok Profesi." });
        continue;
      }

      let employeeRankId: string | null = null;
      if (rawRank) {
        const rankId = rankMap.get(rawRank.toLowerCase());
        if (!rankId) {
          errors.push({ row: rowNum, message: `Pangkat/Golongan '${rawRank}' tidak ditemukan di database.` });
          continue;
        }
        employeeRankId = rankId;
      }

      const selectedRoles: Role[] = [];
      if (rawRoles) {
        const rolesArr = rawRoles.split(",").map((r) => r.trim().toUpperCase());
        let rolesValid = true;
        for (const r of rolesArr) {
          if (r === "EMPLOYEE" || r === "HR_ADMIN" || r === "STAFF") {
            selectedRoles.push(r as Role);
          } else {
            errors.push({
              row: rowNum,
              message: `Peran '${r}' tidak valid. Harus berupa 'EMPLOYEE', 'HR_ADMIN', atau 'STAFF'.`,
            });
            rolesValid = false;
            break;
          }
        }
        if (!rolesValid) continue;
      } else {
        selectedRoles.push("EMPLOYEE");
      }

      importedUsers.push({
        name: rawName,
        email: rawEmail,
        employeeId: rawNip,
        gender,
        birthDate,
        employmentStatusId,
        employeeGroupId,
        professionGroupId,
        employeePositionId,
        employeeRankId,
        roles: selectedRoles,
      });
    }

    let successCount = 0;

    for (const u of importedUsers) {
      try {
        const primaryRole = getHighestRole(u.roles);

        const newUser = await prisma.$transaction(async (tx) => {
          const dbUser = await tx.user.create({
            data: {
              email: u.email,
              name: u.name,
              passwordHash: defaultPasswordHash,
              role: primaryRole,
              employeeId: u.employeeId,
              gender: u.gender,
              birthDate: u.birthDate,
              employmentStatusId: u.employmentStatusId,
              employeeGroupId: u.employeeGroupId,
              professionGroupId: u.professionGroupId,
              employeePositionId: u.employeePositionId,
              employeeRankId: u.employeeRankId,
            },
          });

          await tx.userRole.createMany({
            data: u.roles.map((r: any) => ({
              userId: dbUser.id,
              role: r,
            })),
          });

          return dbUser;
        });

        successCount++;

        await logSecurityEvent({
          actorName: session.user.name || "Admin/Staff",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.USER_CREATED,
          resource: `USER-${newUser.id}`,
          ipAddress: ip,
          metadata: {
            createdUserEmail: newUser.email,
            createdUserRoles: u.roles,
            importMethod: "CSV_BULK",
          },
        });
      } catch (dbErr: any) {
        console.error(`Error saving user ${u.email}:`, dbErr);
        errors.push({
          row: -1,
          email: u.email,
          message: `Gagal menyimpan ke database: ${dbErr?.message || "Unknown error"}`,
        });
      }
    }

    return NextResponse.json({
      data: {
        successCount,
        errorCount: errors.length,
        errors,
      },
    });
  } catch (err: unknown) {
    console.error("[Users Import API POST] Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Gagal mengimpor data pegawai.";
    return NextResponse.json({ error: { message: errorMsg } }, { status: 500 });
  }
}
