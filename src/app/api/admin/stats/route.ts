import { NextResponse } from "next/server";
import { verifyApiSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function GET() {
  const { session, errorResponse } = await verifyApiSession(["HR_ADMIN", "STAFF"]);
  if (errorResponse) return errorResponse;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        gender: true,
        birthDate: true,
        role: true,
        employmentStatus: { select: { name: true } },
        employeePosition: { select: { name: true } },
      },
    });

    let maleCount = 0;
    let femaleCount = 0;
    let unknownGenderCount = 0;

    let activeCount = 0;       // < 55
    let approachingCount = 0;  // 55 - 57
    let retiredCount = 0;      // >= 58
    let noBirthDateCount = 0;

    const retirementDetails: Array<{
      id: string;
      name: string;
      email: string;
      employeeId: string | null;
      gender: string | null;
      birthDate: string | null;
      age: number;
      status: "MENDEKATI_PENSIUN" | "PENSIUN";
    }> = [];

    users.forEach((u) => {
      // 1. Gender calculation
      if (u.gender === "L") {
        maleCount++;
      } else if (u.gender === "P") {
        femaleCount++;
      } else {
        unknownGenderCount++;
      }

      // 2. Age and Retirement calculations (limit 58)
      if (u.birthDate) {
        const age = calculateAge(new Date(u.birthDate));
        if (age < 55) {
          activeCount++;
        } else if (age >= 55 && age <= 57) {
          approachingCount++;
          retirementDetails.push({
            id: u.id,
            name: u.name,
            email: u.email,
            employeeId: u.employeeId,
            gender: u.gender,
            birthDate: u.birthDate.toISOString().split("T")[0],
            age,
            status: "MENDEKATI_PENSIUN",
          });
        } else {
          // age >= 58
          retiredCount++;
          retirementDetails.push({
            id: u.id,
            name: u.name,
            email: u.email,
            employeeId: u.employeeId,
            gender: u.gender,
            birthDate: u.birthDate.toISOString().split("T")[0],
            age,
            status: "PENSIUN",
          });
        }
      } else {
        noBirthDateCount++;
      }
    });

    // 3. Status Kepegawaian + Gender and Position aggregates
    const statusGenderCounts = new Map<string, number>();
    const positionCounts = new Map<string, number>();

    users.forEach((u) => {
      // Status + Gender combination
      const statusName = u.employmentStatus?.name || "Belum Ditentukan";
      const genderLabel = u.gender === "L" ? "Laki-laki" : u.gender === "P" ? "Perempuan" : "Tidak Diketahui";
      const statusGenderKey = `${statusName} - ${genderLabel}`;
      statusGenderCounts.set(statusGenderKey, (statusGenderCounts.get(statusGenderKey) || 0) + 1);

      // Position (Jabatan)
      const positionName = u.employeePosition?.name || "Belum Ditentukan";
      positionCounts.set(positionName, (positionCounts.get(positionName) || 0) + 1);
    });

    const statusGenderStats = Array.from(statusGenderCounts.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    const positionStats = Array.from(positionCounts.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Sort alphabetically for display consistency
    statusGenderStats.sort((a, b) => a.name.localeCompare(b.name));
    positionStats.sort((a, b) => a.name.localeCompare(b.name));

    // Sort retirement details: retired first, then older ages desc
    retirementDetails.sort((a, b) => b.age - a.age);

    return NextResponse.json({
      data: {
        totalEmployees: users.length,
        genderStats: {
          maleCount,
          femaleCount,
          unknownGenderCount,
        },
        retirementStats: {
          activeCount,
          approachingCount,
          retiredCount,
          noBirthDateCount,
          retirementAgeLimit: 58,
        },
        retirementList: retirementDetails,
        statusGenderStats,
        positionStats,
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error("[Stats API] GET Error:", error);
    return NextResponse.json({ error: { message: error.message || "Gagal memproses statistik kepegawaian." } }, { status: 500 });
  }
}
