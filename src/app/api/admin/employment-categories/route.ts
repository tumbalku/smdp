import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  if (session.user.role !== "HR_ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  try {
    const data = await prisma.employmentStatus.findMany({
      include: {
        groups: {
          include: {
            positions: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("[Employment Categories GET] Error:", error);
    const errMessage = error instanceof Error ? error.message : "Gagal mengambil kategori kepegawaian";
    return NextResponse.json(
      { success: false, error: { message: errMessage } },
      { status: 500 }
    );
  }
}
