import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Award, Briefcase, Clock, Calendar, MapPin, Users } from "lucide-react";
import { UserProfile } from "../types";
import { parseNIPDetails, formatIndoDate, formatMonthYear } from "../utils";

interface PnsDetailsCardProps {
  profile: UserProfile;
}

export function PnsDetailsCard({ profile }: PnsDetailsCardProps) {
  // If the user has no employment status or group, we can still render the card with empty status.
  const isPns = profile.employeeGroup?.name === "PNS";
  const nipDetails = isPns && profile.employeeId
    ? parseNIPDetails(profile.employeeId, profile.birthDate, profile.createdAt)
    : null;

  return (
    <Card className="shadow-md border-l-4 border-l-primary border border-border overflow-hidden bg-card transition-all duration-200">
      <CardHeader className="pb-3 border-b border-border bg-muted/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Detail Kepegawaian & Penugasan
              </CardTitle>
              <CardDescription className="text-xs">
                Informasi status kepegawaian resmi dan unit penugasan Anda
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
            {profile.employmentStatus?.name && (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {profile.employmentStatus.name}
              </span>
            )}
            {profile.employeeGroup?.name && (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                {profile.employeeGroup.name}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Core Kepegawaian Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Status & Klasifikasi */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status & Kelompok Profesi
                </p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">
                  {profile.employmentStatus?.name || "Belum ditentukan"} - {profile.employeeGroup?.name || "Belum ditentukan"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Kelompok Profesi: <span className="font-semibold text-foreground">{profile.professionGroup?.name || "Belum ditentukan"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Unit Kerja / Tempat Tugas
                </p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">
                  {profile.workplace?.name || "Belum ditentukan"}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Jabatan & Kedudukan */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Jabatan & Golongan
                </p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">
                  {profile.employeePosition?.name || "Belum ditentukan"}
                </p>
                {profile.employeeRank?.name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Pangkat / Golongan: <span className="font-semibold text-[#6c63ff]">{profile.employeeRank.name}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nomor Identitas Pegawai (NIP/NIK)
                </p>
                <p className="text-sm font-mono font-bold text-foreground mt-0.5">
                  {profile.employeeId || "-"}
                </p>
                {isPns && nipDetails && (
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    {nipDetails.isNipValid ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">✓ Format NIP Valid</span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">⚠ Format NIP tidak standar</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PNS Details Block: Masa Kerja & Estimasi Pensiun */}
        {isPns && nipDetails && (
          <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Masa Kerja Aktif
                </p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">
                  {nipDetails.yearsActive} Tahun, {nipDetails.monthsActive} Bulan
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mulai CPNS: <span className="font-semibold text-foreground">{formatMonthYear(nipDetails.cpnsDate)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Estimasi Pensiun (Batas Usia 58 Tahun)
                </p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">
                  {formatIndoDate(nipDetails.retirementDate)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nipDetails.hasRetired ? (
                    <span className="text-destructive font-semibold">Sudah memasuki masa pensiun</span>
                  ) : (
                    <>
                      Estimasi: <span className="font-bold text-primary">{nipDetails.yearsToRetire} Tahun, {nipDetails.monthsToRetire} Bulan Lagi</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
