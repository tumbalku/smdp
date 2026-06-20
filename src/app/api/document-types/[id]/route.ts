import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if there are any documents uploaded for this document type
    const count = await prisma.documentRecord.count({
      where: { documentTypeId: id },
    });

    if (count > 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "CONFLICT",
            message: "Gagal menghapus. Jenis dokumen ini sedang digunakan oleh berkas pegawai.",
          },
        },
        { status: 409 }
      );
    }

    await prisma.documentType.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("DELETE Document Type Error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Gagal menghapus jenis dokumen." },
      },
      { status: 500 }
    );
  }
}
