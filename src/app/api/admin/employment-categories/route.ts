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
    const [employmentStatuses, professionGroups, employeeRanks, workplaces] = await Promise.all([
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
      prisma.employeeRank.findMany({
        orderBy: {
          name: "asc",
        },
      }),
      prisma.workplace.findMany({
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
        employeeRanks,
        workplaces,
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

    if (type === "RANK") {
      const existing = await prisma.employeeRank.findUnique({ where: { name: trimmedName } });
      if (existing) {
        return NextResponse.json({ error: { message: `Pangkat/Golongan '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.employeeRank.create({ data: { name: trimmedName } });
      return NextResponse.json({ success: true, data });
    }

    if (type === "WORKPLACE") {
      const existing = await prisma.workplace.findUnique({ where: { name: trimmedName } });
      if (existing) {
        return NextResponse.json({ error: { message: `Tempat tugas '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.workplace.create({ data: { name: trimmedName } });
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

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id, type, name, parentId } = body;

    if (!id) {
      return NextResponse.json({ error: { message: "ID data wajib dikirim." } }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: { message: "Nama data wajib diisi." } }, { status: 400 });
    }

    const trimmedName = name.trim();

    if (type === "STATUS") {
      const existing = await prisma.employmentStatus.findFirst({
        where: { name: trimmedName, NOT: { id } }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Status kepegawaian '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.employmentStatus.update({
        where: { id },
        data: { name: trimmedName }
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "GROUP") {
      if (!parentId) {
        return NextResponse.json({ error: { message: "Status kepegawaian (parent) wajib dipilih." } }, { status: 400 });
      }
      const existing = await prisma.employeeGroup.findFirst({
        where: {
          name: trimmedName,
          employmentStatusId: parentId,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Jenis kepegawaian '${trimmedName}' sudah terdaftar pada status ini.` } }, { status: 400 });
      }
      const data = await prisma.employeeGroup.update({
        where: { id },
        data: {
          name: trimmedName,
          employmentStatusId: parentId
        }
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "PROFESSION") {
      const existing = await prisma.professionGroup.findFirst({
        where: { name: trimmedName, NOT: { id } }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Kelompok profesi '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.professionGroup.update({
        where: { id },
        data: { name: trimmedName }
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "POSITION") {
      if (!parentId) {
        return NextResponse.json({ error: { message: "Kelompok profesi (parent) wajib dipilih." } }, { status: 400 });
      }
      const existing = await prisma.employeePosition.findFirst({
        where: {
          name: trimmedName,
          professionGroupId: parentId,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Jabatan '${trimmedName}' sudah terdaftar pada kelompok profesi ini.` } }, { status: 400 });
      }
      const data = await prisma.employeePosition.update({
        where: { id },
        data: {
          name: trimmedName,
          professionGroupId: parentId
        }
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "RANK") {
      const existing = await prisma.employeeRank.findFirst({
        where: { name: trimmedName, NOT: { id } }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Pangkat/Golongan '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.employeeRank.update({
        where: { id },
        data: { name: trimmedName }
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "WORKPLACE") {
      const existing = await prisma.workplace.findFirst({
        where: { name: trimmedName, NOT: { id } }
      });
      if (existing) {
        return NextResponse.json({ error: { message: `Tempat tugas '${trimmedName}' sudah terdaftar.` } }, { status: 400 });
      }
      const data = await prisma.workplace.update({
        where: { id },
        data: { name: trimmedName }
      });
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: { message: "Tipe master data tidak valid." } }, { status: 400 });
  } catch (error: unknown) {
    console.error("[Employment Categories PATCH] Error:", error);
    const errMessage = error instanceof Error ? error.message : "Gagal memperbarui master data.";
    return NextResponse.json({ error: { message: errMessage } }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: { message: "ID dan tipe master data wajib dikirim." } }, { status: 400 });
    }

    if (type === "STATUS") {
      const data = await prisma.employmentStatus.delete({ where: { id } });
      return NextResponse.json({ success: true, data });
    }

    if (type === "GROUP") {
      const data = await prisma.employeeGroup.delete({ where: { id } });
      return NextResponse.json({ success: true, data });
    }

    if (type === "PROFESSION") {
      const data = await prisma.professionGroup.delete({ where: { id } });
      return NextResponse.json({ success: true, data });
    }

    if (type === "POSITION") {
      const data = await prisma.employeePosition.delete({ where: { id } });
      return NextResponse.json({ success: true, data });
    }

    if (type === "RANK") {
      const data = await prisma.employeeRank.delete({ where: { id } });
      return NextResponse.json({ success: true, data });
    }

    if (type === "WORKPLACE") {
      const data = await prisma.workplace.delete({ where: { id } });
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: { message: "Tipe master data tidak valid." } }, { status: 400 });
  } catch (error: unknown) {
    console.error("[Employment Categories DELETE] Error:", error);
    const errMessage = error instanceof Error ? error.message : "Gagal menghapus master data.";
    return NextResponse.json({ error: { message: errMessage } }, { status: 500 });
  }
}
