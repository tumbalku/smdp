"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- Javanese & Islamic Calendar Helpers ---

const getJavaneseWeton = (date: Date) => {
  const pasaranList = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  const baseDate = new Date(1970, 0, 1); // January 1, 1970 was Wage (index 3)
  const d1 = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
  
  let pasaranIdx = (diffDays + 3) % 5;
  if (pasaranIdx < 0) pasaranIdx += 5;
  const pasaranName = pasaranList[pasaranIdx];
  
  const daysList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayName = daysList[date.getDay()];
  
  return `${dayName} ${pasaranName}`;
};

const getJavaneseNeptu = (date: Date) => {
  const pasaranList = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  const baseDate = new Date(1970, 0, 1);
  const d1 = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
  
  let pasaranIdx = (diffDays + 3) % 5;
  if (pasaranIdx < 0) pasaranIdx += 5;
  const pasaranName = pasaranList[pasaranIdx];
  
  const dayVal: { [key: number]: number } = {
    0: 5, // Minggu
    1: 4, // Senin
    2: 3, // Selasa
    3: 7, // Rabu
    4: 8, // Kamis
    5: 6, // Jumat
    6: 9, // Sabtu
  };
  const pasaranVal: { [key: string]: number } = {
    "Kliwon": 8,
    "Legi": 5,
    "Pahing": 9,
    "Pon": 7,
    "Wage": 4,
  };
  
  return (dayVal[date.getDay()] || 0) + (pasaranVal[pasaranName] || 0);
};

const getJavaneseWuku = (date: Date) => {
  const baseDate = new Date(2000, 4, 21); // Sunday of Wuku Sinta
  const d1 = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
  
  const diffWeeks = Math.floor(diffDays / 7);
  let wukuIdx = diffWeeks % 30;
  if (wukuIdx < 0) wukuIdx += 30;
  
  const wukuList = [
    "Sinta", "Landep", "Wukir", "Kurantil", "Tolu", 
    "Gumbreg", "Warigalit", "Warigagung", "Julungwangi", "Sungsang", 
    "Galungan", "Kuningan", "Langkir", "Mandasiya", "Julungpujut", 
    "Pahang", "Kuruwelut", "Marakeh", "Tambir", "Medangkungan", 
    "Maktal", "Wuye", "Manahil", "Prangbakat", "Bala", 
    "Wugu", "Wayang", "Kulawu", "Dukut", "Watugunung"
  ];
  
  return wukuList[wukuIdx];
};

const getIslamicAndJavaneseDate = (date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    });
    const parts = formatter.formatToParts(date);
    const dayVal = parts.find(p => p.type === "day")?.value || "";
    const monthVal = parseInt(parts.find(p => p.type === "month")?.value || "0", 10);
    const yearVal = parseInt(parts.find(p => p.type === "year")?.value || "0", 10);
    
    const javaneseMonths = [
      "Sura", "Sapar", "Mulud", "Bakda Mulud", "Jumadil Awal", "Jumadil Akhir",
      "Rejeb", "Ruwah", "Pasa", "Sawal", "Sela", "Besar"
    ];
    
    const javaneseMonthName = javaneseMonths[monthVal - 1] || "Sura";
    
    const hijriahMonths = [
      "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", "Jumadil Akhir",
      "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
    ];
    const hijriahMonthName = hijriahMonths[monthVal - 1] || "Muharram";
    
    const hijriahDateStr = `${dayVal} ${hijriahMonthName} ${yearVal} H`;
    const javaneseDateStr = `${dayVal} ${javaneseMonthName} ${yearVal + 512}`;
    
    return {
      hijriah: hijriahDateStr,
      javanese: javaneseDateStr
    };
  } catch {
    return {
      hijriah: "",
      javanese: ""
    };
  }
};

// --- Custom Grid Generation Helpers ---

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  const startDay = date.getDay(); // 0 is Sunday
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // 1. Trailing days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    days.push({
      date: new Date(year, month - 1, dayNum),
      isCurrentMonth: false,
    });
  }

  // 2. Days of the current month
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // 3. Leading days of the next month to fill exactly 42 grid cells (6 rows)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
};

const getDaysInWeek = (referenceDate: Date) => {
  const days = [];
  const startOfWeek = new Date(referenceDate);
  // Find the Sunday of the active week
  startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
    });
  }
  return days;
};

// --- Main Component ---

export function CalendarSection({ isDashboard = false }: { isDashboard?: boolean }) {
  const [holidays, setHolidays] = useState<{ name: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [visibleStart, setVisibleStart] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState("month");

  // Floating Popover details state
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    date: Date;
    holiday: { name: string; date: string } | null;
    top: number;
    left: number;
  } | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch("/api/holidays");
        const resData = await res.json();

        if (res.ok && resData.success) {
          setHolidays(resData.data || []);
        } else {
          throw new Error(resData.error || "Gagal mengambil data kalender.");
        }
      } catch (error) {
        console.error("Gagal memuat data hari libur:", error);
        const msg = error instanceof Error ? error.message : "Gagal menghubungkan ke server API Libur.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  // Filter holidays belonging to the visible month/year to display in the footnote
  const currentMonthHolidays = holidays.filter((h) => {
    const parts = h.date.split("-");
    if (parts.length !== 3) return false;
    const hYear = parseInt(parts[0], 10);
    const hMonth = parseInt(parts[1], 10) - 1; // 0-indexed

    return (
      hMonth === visibleStart.getMonth() &&
      hYear === visibleStart.getFullYear()
    );
  });

  // Sort holidays chronologically
  currentMonthHolidays.sort((a, b) => a.date.localeCompare(b.date));

  // --- Custom Navigation Handlers & Restrictions ---

  const currentYear = new Date().getFullYear();

  const isPrevDisabled = (() => {
    const prevDate = new Date(visibleStart);
    if (currentView === "month") {
      prevDate.setMonth(visibleStart.getMonth() - 1);
    } else {
      prevDate.setDate(visibleStart.getDate() - 7);
    }
    return prevDate.getFullYear() !== currentYear;
  })();

  const isNextDisabled = (() => {
    const nextDate = new Date(visibleStart);
    if (currentView === "month") {
      nextDate.setMonth(visibleStart.getMonth() + 1);
    } else {
      nextDate.setDate(visibleStart.getDate() + 7);
    }
    return nextDate.getFullYear() !== currentYear;
  })();

  const handlePrev = () => {
    if (isPrevDisabled) return;
    const newDate = new Date(visibleStart);
    if (currentView === "month") {
      newDate.setMonth(visibleStart.getMonth() - 1);
    } else {
      newDate.setDate(visibleStart.getDate() - 7);
    }
    setVisibleStart(newDate);
    setSelectedDateInfo(null);
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    const newDate = new Date(visibleStart);
    if (currentView === "month") {
      newDate.setMonth(visibleStart.getMonth() + 1);
    } else {
      newDate.setDate(visibleStart.getDate() + 7);
    }
    setVisibleStart(newDate);
    setSelectedDateInfo(null);
  };

  const handleToday = () => {
    setVisibleStart(new Date());
    setSelectedDateInfo(null);
  };

  const handleMonthView = () => {
    setCurrentView("month");
    setSelectedDateInfo(null);
  };

  const handleWeekView = () => {
    setCurrentView("week");
    setSelectedDateInfo(null);
  };

  const handleDayClick = (date: Date, e: React.MouseEvent<HTMLDivElement>) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    
    const h = holidays.find((item) => item.date === dateStr);

    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const elRect = e.currentTarget.getBoundingClientRect();
      
      // Calculate popover positioning directly relative to card container
      const top = elRect.bottom - cardRect.top + 8;
      const left = elRect.left - cardRect.left + (elRect.width / 2) - 130;
      
      setSelectedDateInfo({
        date,
        holiday: h || null,
        top,
        left: Math.max(10, Math.min(left, cardRect.width - 270)),
      });
    }
  };

  // Month Name & Number (from visibleStart)
  const monthName = visibleStart.toLocaleDateString("id-ID", { month: "long" });
  const monthNumber = String(visibleStart.getMonth() + 1).padStart(2, "0");

  // Generate days based on month/week view
  const days = currentView === "month"
    ? getDaysInMonth(visibleStart.getFullYear(), visibleStart.getMonth())
    : getDaysInWeek(visibleStart);

  const today = new Date();
  const isToday = (d: Date) => {
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card ref={cardRef} className="border border-border shadow-xs relative overflow-visible">
      {/* Dynamic Popover Floating Overlay */}
      {selectedDateInfo && (
        <div
          className="absolute z-50 w-[260px] bg-card border border-border text-foreground rounded-xl shadow-xl p-4 text-xs space-y-3 transition-all animate-in fade-in zoom-in duration-200"
          style={{
            top: `${selectedDateInfo.top}px`,
            left: `${selectedDateInfo.left}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-extrabold text-sm text-foreground capitalize">
                {selectedDateInfo.date.toLocaleDateString("id-ID", { weekday: "long" })}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {selectedDateInfo.date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedDateInfo(null)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-border" />

          {/* Holiday Information */}
          {selectedDateInfo.holiday ? (
            <>
              <div className="space-y-1">
                <div className="flex items-start gap-2 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                  <span className="text-foreground text-xs leading-normal">
                    {selectedDateInfo.holiday.name}
                  </span>
                </div>
                <p className="text-[9px] font-extrabold text-muted-foreground pl-4 uppercase tracking-wider">
                  {selectedDateInfo.holiday.name.toLowerCase().includes("cuti")
                    ? "Cuti Bersama"
                    : "Libur Nasional"}
                </p>
              </div>
              <div className="border-t border-border" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                <span>Hari Kerja Biasa</span>
              </div>
              <div className="border-t border-border" />
            </>
          )}

          {/* Hijriah Date */}
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Hijriah</p>
            <p className="text-sm font-extrabold text-foreground">
              {getIslamicAndJavaneseDate(selectedDateInfo.date).hijriah || "-"}
            </p>
          </div>

          <div className="border-t border-border" />

          {/* Javanese Calendar Details */}
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Jawa</p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">Weton</span>
                <span className="font-extrabold text-foreground">
                  {getJavaneseWeton(selectedDateInfo.date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">Neptu</span>
                <span className="font-extrabold text-foreground">
                  {getJavaneseNeptu(selectedDateInfo.date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">Wuku</span>
                <span className="font-extrabold text-foreground">
                  {getJavaneseWuku(selectedDateInfo.date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">Kalender</span>
                <span className="font-extrabold text-foreground">
                  {getIslamicAndJavaneseDate(selectedDateInfo.date).javanese || "-"}
                </span>
              </div>
            </div>
          </div>

          {isDashboard && (
            <>
              <div className="border-t border-border" />
              <Link
                href="/calendar"
                onClick={() => setSelectedDateInfo(null)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-wide"
              >
                Lihat detail <ChevronRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      )}

      {/* Styled Premium Header Toolbar */}
      <CardHeader className="p-5 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-foreground">
            <span className="text-lg font-extrabold capitalize select-none">
              {monthName}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
            <span className="text-xs font-bold text-muted-foreground/40 mt-1 select-none">
              {monthNumber}
            </span>
          </div>

          {/* Render standard Next/Prev/View controls only if NOT in Dashboard mode */}
          {!isDashboard ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center border border-border rounded-lg bg-card shadow-2xs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground"
                  onClick={handlePrev}
                  disabled={isPrevDisabled}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="w-[1px] h-4 bg-border" />
                <Button
                  variant="ghost"
                  className="h-8 px-3 text-xs font-extrabold text-foreground"
                  onClick={handleToday}
                >
                  Hari Ini
                </Button>
                <div className="w-[1px] h-4 bg-border" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground"
                  onClick={handleNext}
                  disabled={isNextDisabled}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center border border-border rounded-lg bg-card shadow-2xs p-0.5">
                <Button
                  variant={currentView === "month" ? "secondary" : "ghost"}
                  className="h-7 px-3 text-xs font-extrabold"
                  onClick={handleMonthView}
                >
                  Bulan
                </Button>
                <Button
                  variant={currentView === "week" ? "secondary" : "ghost"}
                  className="h-7 px-3 text-xs font-extrabold"
                  onClick={handleWeekView}
                >
                  Minggu
                </Button>
              </div>
            </div>
          ) : (
            <Link
              href="/calendar"
              className="text-[10px] font-extrabold hover:underline uppercase px-2.5 py-1.5 rounded-lg border border-border bg-card shadow-2xs hover:bg-muted text-primary whitespace-nowrap"
            >
              Lihat Detail
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        {errorMsg && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">Memuat kalender...</p>
          </div>
        ) : (
          <div>
            {/* Custom Unified CSS Grid Calendar Layout */}
            <div className="w-full border-t border-l border-border rounded-lg overflow-hidden select-none">
              {/* Header Days Row */}
              <div className="grid grid-cols-7 bg-muted/10">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`text-center py-2.5 text-xs font-bold border-r border-b border-border ${
                      idx === 0 ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7">
                {days.map((day, idx) => {
                  const dayY = day.date.getFullYear();
                  const dayM = String(day.date.getMonth() + 1).padStart(2, "0");
                  const dayD = String(day.date.getDate()).padStart(2, "0");
                  const dateStr = `${dayY}-${dayM}-${dayD}`;
                  
                  const isSun = day.date.getDay() === 0;
                  const isCurr = day.isCurrentMonth;
                  const isOutsideYear = dayY !== currentYear;
                  
                  const h = holidays.find((item) => item.date === dateStr);
                  const isCuti = h ? h.name.toLowerCase().includes("cuti") : false;
                  const isLibur = h ? !isCuti : false;
                  const isTdy = isToday(day.date);

                  // Base text colors
                  let textClass = "text-foreground font-semibold";
                  if (isOutsideYear) {
                    textClass = "text-muted-foreground/20";
                  } else if (!isCurr) {
                    textClass = isSun ? "text-red-500/35" : "text-muted-foreground/35";
                  } else if (isSun) {
                    textClass = "text-red-500";
                  }

                  // Circle highlights (only apply for current year)
                  let circleClass = "";
                  if (!isOutsideYear) {
                    if (isLibur) {
                      circleClass = "bg-[#ef4444] text-white font-bold";
                    } else if (isCuti) {
                      circleClass = "bg-red-100 dark:bg-red-950/50 text-[#ef4444] dark:text-red-400 font-bold";
                    } else if (isTdy) {
                      circleClass = "bg-primary/10 border border-primary/20 text-primary font-bold";
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col justify-center items-center h-[42px] border-b border-r border-border transition-colors ${
                        isOutsideYear
                          ? "opacity-20 cursor-not-allowed pointer-events-none"
                          : "cursor-pointer hover:bg-muted/50"
                      } ${
                        isTdy && !isLibur && !isCuti && !isOutsideYear ? "bg-primary/5" : ""
                      }`}
                      onClick={(e) => {
                        if (!isOutsideYear) {
                          handleDayClick(day.date, e);
                        }
                      }}
                    >
                      <div
                        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs transition-all ${circleClass} ${
                          !circleClass ? textClass : ""
                        }`}
                      >
                        {day.date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Premium Custom Footnote */}
            <div className="mt-5 pt-4 border-t border-border/80 space-y-3 select-none">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 flex-shrink-0" />
                Hari Libur Nasional & Cuti Bersama
              </p>
              {currentMonthHolidays.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic pl-1">
                  Tidak ada hari libur nasional di bulan ini.
                </p>
              ) : (
                <ul className="space-y-2">
                  {currentMonthHolidays.map((h, idx) => {
                    const parts = h.date.split("-");
                    const dayNum = parseInt(parts[2], 10);
                    
                    return (
                      <li key={idx} className="flex items-center text-xs gap-3">
                        <span className="w-5 text-right font-extrabold text-foreground/80">{dayNum}</span>
                        <span className="w-[2px] h-3.5 bg-rose-500 rounded-full flex-shrink-0" />
                        <span className="text-muted-foreground font-semibold truncate leading-none" title={h.name}>
                          {h.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

