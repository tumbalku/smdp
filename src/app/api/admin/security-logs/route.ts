import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventType, LogStatus, Prisma } from "@prisma/client";

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
