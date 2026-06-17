import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUserProfile } from "@/services/userService";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Belum login." } },
        { status: 401 }
      );
    }

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
  } catch (error: any) {
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
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Belum login." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { namaLahir, alamatLengkap, nomorTelepon, gelarAkademik, gender, birthDate } = body;

    const updatedProfile = await updateUserProfile(session.user.id, {
      namaLahir,
      alamatLengkap,
      nomorTelepon,
      gelarAkademik,
      gender,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    });

    return NextResponse.json({ data: updatedProfile, error: null });
  } catch (error: any) {
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
