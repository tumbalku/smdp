import { NextRequest, NextResponse } from "next/server";
import { verifyApiSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { EventType, LogStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await verifyApiSession(["HR_ADMIN", "STAFF"]);
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 10;

  const eventType = searchParams.get("eventType");
  const actorRole = searchParams.get("actorRole");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");

  const where: Prisma.SecurityLogWhereInput = {};

  if (eventType && eventType !== "ALL") {
    where.eventType = eventType as EventType;
  }
  if (actorRole && actorRole !== "ALL") {
    where.actorRole = { contains: actorRole };
  }
  if (status && status !== "ALL") {
    where.status = status as LogStatus;
  }
  if (dateFrom || dateTo) {
    where.timestamp = {};
    if (dateFrom) where.timestamp.gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      where.timestamp.lte = to;
    }
  }
  if (search) {
    where.OR = [
      { actorName: { contains: search } },
      { resource: { contains: search } },
      { ipAddress: { contains: search } },
    ];
  }

  const [total, logs] = await Promise.all([
    prisma.securityLog.count({ where }),
    prisma.securityLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: logs,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
