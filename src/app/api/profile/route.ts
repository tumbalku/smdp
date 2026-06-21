import { NextRequest, NextResponse } from "next/server";
import { verifyApiSession } from "@/lib/auth-utils";
import { getUserById, updateUserProfile } from "@/services/userService";

export async function GET() {
  try {
    const { session, errorResponse } = await verifyApiSession();
    if (errorResponse) return errorResponse;

    const userProfile = await getUserById(session.user.id);

    if (!userProfile) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Pengguna tidak ditemukan.",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: userProfile, error: null });
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server." },
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { session, errorResponse } = await verifyApiSession();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { namaLahir, alamatLengkap, nomorTelepon, gelarAkademik, gender, birthDate, agama, pendidikanTerakhir, statusPernikahan } = body;

    const updatedProfile = await updateUserProfile(session.user.id, {
      namaLahir,
      alamatLengkap,
      nomorTelepon,
      gelarAkademik,
      gender,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      agama,
      pendidikanTerakhir,
      statusPernikahan,
    });

    return NextResponse.json({ data: updatedProfile, error: null });
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server." },
      },
      { status: 500 }
    );
  }
}
