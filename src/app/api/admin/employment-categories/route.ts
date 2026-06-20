import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const [employmentStatuses, professionGroups] = await Promise.all([
      prisma.employmentStatus.findMany({
        include: {
          groups: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.professionGroup.findMany({
        include: {
          positions: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        employmentStatuses,
        professionGroups,
      },
    });
  } catch (error: unknown) {
    console.error("[Employment Categories GET] Error:", error);
    const errMessage = error instanceof Error ? error.message : "Gagal mengambil kategori kepegawaian";
    return NextResponse.json(
      { success: false, error: { message: errMessage } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { type, name, parentId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: { message: "Nama data wajib diisi." } }, { status: 400 });
    }

    const trimmedName = name.trim();

    if (type === "STATUS") {
      const existing = await prisma.employmentStatus.findUnique({ where: { name: trimmedName } });
      if (existing) {
        return NextResponse.json({ error: { message: `Status kepegawaian '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.employmentStatus.create({ data: { name: trimmedName } });
      return NextResponse.json({ success: true, data });
    } 
    
    if (type === "GROUP") {
      if (!parentId) {
        return NextResponse.json({ error: { message: "Status kepegawaian (parent) wajib dipilih." } }, { status: 400 });
      }
      const existing = await prisma.employeeGroup.findUnique({
        where: {
          name_employmentStatusId: {
            name: trimmedName,
            employmentStatusId: parentId,
          }
        }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Jenis kepegawaian '${trimmedName}' sudah terdaftar pada status ini.` } }, { status: 400 });
      }
      const data = await prisma.employeeGroup.create({
        data: {
          name: trimmedName,
          employmentStatusId: parentId,
        }
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "PROFESSION") {
      const existing = await prisma.professionGroup.findUnique({ where: { name: trimmedName } });
      if (existing) {
        return NextResponse.json({ error: { message: `Kelompok profesi '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.professionGroup.create({ data: { name: trimmedName } });
      return NextResponse.json({ success: true, data });
    }

    if (type === "POSITION") {
      if (!parentId) {
        return NextResponse.json({ error: { message: "Kelompok profesi (parent) wajib dipilih." } }, { status: 400 });
      }
      const existing = await prisma.employeePosition.findUnique({
        where: {
          name_professionGroupId: {
            name: trimmedName,
            professionGroupId: parentId,
          }
        }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Jabatan '${trimmedName}' sudah terdaftar pada kelompok profesi ini.` } }, { status: 400 });
      }
      const data = await prisma.employeePosition.create({
        data: {
          name: trimmedName,
          professionGroupId: parentId,
        }
      });
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: { message: "Tipe master data tidak valid." } }, { status: 400 });
  } catch (error: unknown) {
    console.error("[Employment Categories POST] Error:", error);
    const errMessage = error instanceof Error ? error.message : "Gagal menambahkan master data.";
    return NextResponse.json({ error: { message: errMessage } }, { status: 500 });
  }
}
