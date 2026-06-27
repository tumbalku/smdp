import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { documentTypeSchema, documentTypeUpdateArraySchema } from "@/lib/validations/documentTypeValidation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const documentTypes = await prisma.documentType.findMany({
      orderBy: { name: "asc" },
    });

    const roles = session?.user?.roles || (session?.user?.role ? [session.user.role] : []);
    if (session?.user?.id && roles.includes("EMPLOYEE")) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { professionGroup: true },
      });
      const userProfName = user?.professionGroup?.name || null;

      const filtered = documentTypes.filter((type) => {
        if (!type.targetPositions) return true;
        if (!userProfName) return false;
        const allowed = type.targetPositions.split(",").map((p) => p.trim());
        return allowed.includes(userProfName);
      });

      return NextResponse.json({ data: filtered, error: null });
    }

    return NextResponse.json({ data: documentTypes, error: null });
  } catch (error) {
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
    const roles = session?.user?.roles || (session?.user?.role ? [session.user.role] : []);
    const hasAdminOrStaff = roles.includes("HR_ADMIN") || roles.includes("STAFF");
    if (!session || !hasAdminOrStaff) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = documentTypeSchema.safeParse(body);
    if (!parsed.success) {
      const errMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { data: null, error: { code: "BAD_REQUEST", message: errMsg } },
        { status: 400 }
      );
    }

    const { name, description, targetPositions, isMandatory, requiresExpiryDate, maxSize, allowedFormats, icon } = parsed.data;

    const newType = await prisma.documentType.create({
      data: {
        name,
        description,
        targetPositions: targetPositions || null,
        isMandatory: !!isMandatory,
        requiresExpiryDate: !!requiresExpiryDate,
        maxSize: Number(maxSize) || 5,
        allowedFormats: allowedFormats || "PDF, JPG, PNG",
        icon: icon || "FileText",
      },
    });

    return NextResponse.json({ data: newType, error: null });
  } catch (error) {
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
    const roles = session?.user?.roles || (session?.user?.role ? [session.user.role] : []);
    const hasAdminOrStaff = roles.includes("HR_ADMIN") || roles.includes("STAFF");
    if (!session || !hasAdminOrStaff) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = documentTypeUpdateArraySchema.safeParse(body);
    if (!parsed.success) {
      const errMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { data: null, error: { code: "BAD_REQUEST", message: errMsg } },
        { status: 400 }
      );
    }

    const updates = parsed.data.map((item) => {
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
          icon: item.icon || "FileText",
        },
      });
    });

    const updatedTypes = await prisma.$transaction(updates);

    return NextResponse.json({ data: updatedTypes, error: null });
  } catch (error) {
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
