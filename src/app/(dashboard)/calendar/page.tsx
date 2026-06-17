"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CalendarSection = dynamic(
  () => import("@/components/CalendarSection").then((mod) => mod.CalendarSection),
  {
    ssr: false,
    loading: () => (
      <Card className="border border-border shadow-xs">
        <CardContent className="p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </CardContent>
      </Card>
    ),
  }
);

export default function CalendarPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col items-center" id="calendar-page-container">
      {/* Title Header */}
      <div className="text-center max-w-xl space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Kalender & Hari Libur Nasional {currentYear}
        </h1>
        <p className="text-xs font-bold text-muted-foreground">
          Pantau seluruh hari libur nasional Indonesia dan agenda kepegawaian secara interaktif.
        </p>
      </div>

      <div className="w-full max-w-[480px] mx-auto">
        <CalendarSection isDashboard={false} />
      </div>
    </div>
  );
}
