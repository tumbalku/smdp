import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const documentTypes = await prisma.documentType.findMany({
      orderBy: { name: "asc" },
    });

    if (session?.user?.role === "EMPLOYEE") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { employeePosition: true },
      });
      const userPosName = user?.employeePosition?.name || null;

      const filtered = documentTypes.filter((type) => {
        if (!type.targetPositions) return true;
        if (!userPosName) return false;
        const allowed = type.targetPositions.split(",").map((p) => p.trim());
        return allowed.includes(userPosName);
      });

      return NextResponse.json({ data: filtered, error: null });
    }

    return NextResponse.json({ data: documentTypes, error: null });
  } catch (error: any) {
    console.error("GET Document Types Error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server." },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, targetPositions, isMandatory, requiresExpiryDate, maxSize, allowedFormats } = body;

    if (!name) {
      return NextResponse.json(
        { data: null, error: { code: "BAD_REQUEST", message: "Nama dokumen wajib diisi." } },
        { status: 400 }
      );
    }

    const newType = await prisma.documentType.create({
      data: {
        name,
        description,
        targetPositions: targetPositions || null,
        isMandatory: !!isMandatory,
        requiresExpiryDate: !!requiresExpiryDate,
        maxSize: Number(maxSize) || 5,
        allowedFormats: allowedFormats || "PDF, JPG, PNG",
      },
    });

    return NextResponse.json({ data: newType, error: null });
  } catch (error: any) {
    console.error("POST Document Type Error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Gagal membuat jenis dokumen." },
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { data: null, error: { code: "BAD_REQUEST", message: "Body harus berupa array." } },
        { status: 400 }
      );
    }

    const updates = body.map((item) => {
      return prisma.documentType.update({
        where: { id: item.id },
        data: {
          name: item.name,
          description: item.description,
          targetPositions: item.targetPositions || null,
          isMandatory: !!item.isMandatory,
          requiresExpiryDate: !!item.requiresExpiryDate,
          maxSize: Number(item.maxSize) || 5,
          allowedFormats: item.allowedFormats || "PDF, JPG, PNG",
        },
      });
    });

    const updatedTypes = await prisma.$transaction(updates);

    return NextResponse.json({ data: updatedTypes, error: null });
  } catch (error: any) {
    console.error("PUT Document Types Error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Gagal menyimpan perubahan." },
      },
      { status: 500 }
    );
  }
}
