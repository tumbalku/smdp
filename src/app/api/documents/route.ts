import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getEmployeeDocuments,
  getDocumentsForAdmin,
} from "@/services/documentService";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Belum login." } },
        { status: 401 }
      );
    }

    const { role, id: userId } = session.user;

    if (role === Role.EMPLOYEE) {
      const documents = await getEmployeeDocuments(userId);
      return NextResponse.json({ data: documents, error: null });
    } else if (role === Role.HR_ADMIN || role === Role.STAFF) {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") || "ALL";
      const expiryStatus = searchParams.get("expiryStatus") || "ALL";
      const search = searchParams.get("search") || "";

      const documents = await getDocumentsForAdmin({
        status,
        expiryStatus,
        search,
      });

      return NextResponse.json({ data: documents, error: null });
    }

    return NextResponse.json(
      { data: null, error: { code: "FORBIDDEN", message: "Akses ditolak." } },
      { status: 403 }
    );
  } catch (error: any) {
    console.error("GET Documents Error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server." },
      },
      { status: 500 }
    );
  }
}
