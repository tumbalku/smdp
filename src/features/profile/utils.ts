import { NipDetails } from "./types";

export function parseNIPDetails(nip: string | null, birthDateStr: string | null, createdAtStr: string): NipDetails {
  let birthDate = birthDateStr ? new Date(birthDateStr) : null;
  let cpnsDate = new Date(createdAtStr); // default fallback
  let isNipValid = false;

  if (nip && nip.length === 18 && /^\d+$/.test(nip)) {
    const year = parseInt(nip.substring(0, 4), 10);
    const month = parseInt(nip.substring(4, 6), 10) - 1;
    const day = parseInt(nip.substring(6, 8), 10);
    
    // Parse birth date from NIP if not provided or mismatch
    if (year > 1900 && month >= 0 && month < 12 && day > 0 && day <= 31) {
      birthDate = new Date(year, month, day);
    }

    // Parse CPNS date from NIP (Digit 9-14: YYYYMM)
    const cpnsYear = parseInt(nip.substring(8, 12), 10);
    const cpnsMonth = parseInt(nip.substring(12, 14), 10) - 1;
    if (cpnsYear > 1950 && cpnsMonth >= 0 && cpnsMonth < 12) {
      cpnsDate = new Date(cpnsYear, cpnsMonth, 1);
      isNipValid = true;
    }
  }

  // 1. Calculate Active Period (Masa Aktif) from CPNS date to now
  const now = new Date();
  let yearsActive = now.getFullYear() - cpnsDate.getFullYear();
  let monthsActive = now.getMonth() - cpnsDate.getMonth();
  if (monthsActive < 0) {
    yearsActive--;
    monthsActive += 12;
  }

  // 2. Calculate Retirement (Kemungkinan Pensiun) at age 58
  let retirementDate: Date | null = null;
  let yearsToRetire = 0;
  let monthsToRetire = 0;
  let hasRetired = false;

  if (birthDate) {
    retirementDate = new Date(birthDate);
    retirementDate.setFullYear(birthDate.getFullYear() + 58);

    const timeDiff = retirementDate.getTime() - now.getTime();
    if (timeDiff <= 0) {
      hasRetired = true;
    } else {
      yearsToRetire = retirementDate.getFullYear() - now.getFullYear();
      monthsToRetire = retirementDate.getMonth() - now.getMonth();
      if (monthsToRetire < 0) {
        yearsToRetire--;
        monthsToRetire += 12;
      }
    }
  }

  return {
    birthDate,
    cpnsDate,
    yearsActive: Math.max(0, yearsActive),
    monthsActive: Math.max(0, monthsActive),
    retirementDate,
    yearsToRetire: Math.max(0, yearsToRetire),
    monthsToRetire: Math.max(0, monthsToRetire),
    hasRetired,
    isNipValid,
  };
}

export const INDO_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const INDO_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function formatIndoDate(date: Date | null): string {
  if (!date) return "-";
  const dayName = INDO_DAYS[date.getDay()];
  const day = date.getDate();
  const monthName = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function formatMonthYear(date: Date | null): string {
  if (!date) return "-";
  const monthName = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${monthName} ${year}`;
}
