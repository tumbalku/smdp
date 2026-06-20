import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Award, Briefcase, Clock, Calendar } from "lucide-react";
import { UserProfile } from "../types";
import { parseNIPDetails, formatIndoDate, formatMonthYear } from "../utils";

interface PnsDetailsCardProps {
  profile: UserProfile;
}

export function PnsDetailsCard({ profile }: PnsDetailsCardProps) {
  if (profile.employeeGroup?.name !== "PNS") return null;

  const nipDetails = parseNIPDetails(profile.employeeId, profile.birthDate, profile.createdAt);

  return (
    <Card className="shadow-md border-l-4 border-l-primary border border-border overflow-hidden bg-card transition-all duration-200">
      <CardHeader className="pb-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Detail Kepegawaian PNS
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                PNS / ASN
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Informasi otomatis yang diekstrak dari NIP dan profil Anda
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NIP and Occupation */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Status & Jabatan
              </p>
              <p className="text-sm font-extrabold text-foreground mt-0.5">
                ASN - {profile.employeeGroup?.name || "PNS"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Profesi: <span className="font-semibold text-foreground">{profile.employeePosition?.name || "Belum ditentukan"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Nomor Identitas Pegawai (NIP)
              </p>
              <p className="text-sm font-mono font-bold text-foreground mt-0.5">
                {profile.employeeId || "-"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                {nipDetails.isNipValid ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold">✓ Format NIP Valid</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">⚠ Format NIP tidak standar</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Service Term and Retirement */}
        <div className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
