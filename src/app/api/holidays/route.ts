import { NextResponse } from "next/server";

export async function GET() {
  const holidayApiUrl = process.env.HOLIDAY_API_URL || "https://apiharilibur.vercel.app/api";

  try {
    const response = await fetch(holidayApiUrl, {
      next: { revalidate: 86400 }, // Cache on the server for 24 hours (86400 seconds)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holiday API: ${response.status}`);
    }

    const data = await response.json();

    // Standardize/normalize holiday schema for frontend flexibility
    // Expected output: Array<{ date: string; name: string; }>
    if (Array.isArray(data)) {
      const currentYear = new Date().getFullYear();
      const normalized = data
        .map((item: { holiday_date?: string; date?: string; holiday_name?: string; name?: string }) => {
          const rawDate = item.holiday_date || item.date || "";
          let formattedDate = rawDate;

          if (rawDate) {
            const parts = rawDate.split("-");
            if (parts.length === 3) {
              const year = parts[0];
              const month = parts[1].padStart(2, "0");
              const day = parts[2].padStart(2, "0");
              formattedDate = `${year}-${month}-${day}`;
            }
          }

          return {
            date: formattedDate,
            name: item.holiday_name || item.name || "Hari Libur Nasional",
          };
        })
        .filter((item) => {
          if (!item.date) return false;
          const parts = item.date.split("-");
          return parts.length === 3 && parseInt(parts[0], 10) === currentYear;
        });

      return NextResponse.json({ success: true, data: normalized });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to fetch holidays";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
