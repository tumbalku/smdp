import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";
import { EventType, LogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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
      resource: "Export Users Endpoint",
      ipAddress: ip,
      status: LogStatus.FAILED,
      metadata: { error: "Akses ditolak: Peran tidak sah." },
    });
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        employmentStatus: { select: { name: true } },
        employeeGroup: { select: { name: true } },
        professionGroup: { select: { name: true } },
        employeePosition: { select: { name: true } },
        roles: { select: { role: true } },
      },
      orderBy: { name: "asc" },
    });

    const headers = [
      "nama",
      "nip",
      "email",
      "gender",
      "tanggal_lahir",
      "status_kepegawaian",
      "jenis_kepegawaian",
      "kelompok_profesi",
      "jabatan",
      "peran"
    ];

    const escapeCSV = (val: string | null | undefined): string => {
      if (val === null || val === undefined) return "";
      const s = String(val).trim();
      if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csvRows = [headers.join(",")];

    for (const u of users) {
      const birthDateStr = u.birthDate
        ? new Date(u.birthDate).toISOString().split("T")[0]
        : "";

      const mappedRoles = u.roles.map((r) => r.role);
      if (mappedRoles.length === 0) mappedRoles.push(u.role);
      const rolesStr = mappedRoles.join(",");

      const row = [
        escapeCSV(u.name),
        escapeCSV(u.employeeId),
        escapeCSV(u.email),
        escapeCSV(u.gender),
        birthDateStr,
        escapeCSV(u.employmentStatus?.name),
        escapeCSV(u.employeeGroup?.name),
        escapeCSV(u.professionGroup?.name),
        escapeCSV(u.employeePosition?.name),
        escapeCSV(rolesStr),
      ];

      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    // Log the security event
    await logSecurityEvent({
      actorName: session.user.name || "Admin/Staff",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.DATA_EXPORT_LARGE,
      resource: "All Users Database",
      ipAddress: ip,
      metadata: {
        recordCount: users.length,
      },
    });

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=data_pegawai.csv",
      },
    });
  } catch (err: unknown) {
    console.error("[Users Export API GET] Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Gagal mengekspor data pegawai.";
    return NextResponse.json({ error: { message: errorMsg } }, { status: 500 });
  }
}
