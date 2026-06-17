"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck, Award, Briefcase, Clock, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  name: string;
  email: string;
  employeeId: string | null;
  role: string;
  namaLahir: string | null;
  alamatLengkap: string | null;
  nomorTelepon: string | null;
  gelarAkademik: string | null;
  gender: string | null;
  birthDate: string | null;
  createdAt: string;
  employmentStatus: { name: string } | null;
  employeeGroup: { name: string } | null;
  employeePosition: { name: string } | null;
}

function parseNIPDetails(nip: string | null, birthDateStr: string | null, createdAtStr: string) {
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

const INDO_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const INDO_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function formatIndoDate(date: Date | null): string {
  if (!date) return "-";
  const dayName = INDO_DAYS[date.getDay()];
  const day = date.getDate();
  const monthName = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

function formatMonthYear(date: Date | null): string {
  if (!date) return "-";
  const monthName = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${monthName} ${year}`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [namaLahir, setNamaLahir] = useState("");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [nomorTelepon, setNomorTelepon] = useState("");
  const [gelarAkademik, setGelarAkademik] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/profile");
      const resData = await res.json();
      if (resData.data) {
        const p: UserProfile = resData.data;
        setProfile(p);
        setNamaLahir(p.namaLahir || "");
        setAlamatLengkap(p.alamatLengkap || "");
        setNomorTelepon(p.nomorTelepon || "");
        setGelarAkademik(p.gelarAkademik || "");
        setGender(p.gender || "L");
        setBirthDate(p.birthDate ? p.birthDate.split("T")[0] : "");
      } else {
        throw new Error(resData.error?.message || "Gagal mengambil data profil.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLahir,
          alamatLengkap,
          nomorTelepon,
          gelarAkademik,
          gender,
          birthDate: birthDate || null,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal memperbarui profil.");
      }

      setSuccessMsg("Profil Anda berhasil diperbarui.");
      // Refresh local profile
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data profil...</p>
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "Pegawai";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6" id="profile-page-container">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-700">
          <CheckCircle2 className="h-4 w-4" style={{ color: "var(--jobster-success, #22c55e)" }} />
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {profile && (
        <div className="space-y-6">
          {/* Visual Header Summary Card */}
          <Card className="shadow-xs border border-border overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-20 h-20 text-white font-extrabold text-2xl" style={{ backgroundColor: "var(--jobster-accent, #6c63ff)" }}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">{profile.name}</h2>
                <p className="text-xs font-semibold text-muted-foreground">{profile.email}</p>
                <p className="text-xs text-muted-foreground mt-2 font-bold bg-muted py-1 px-2.5 rounded-lg inline-block">
                  NIP: {profile.employeeId || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PNS Details Card */}
          {profile.employeeGroup?.name === "PNS" && (() => {
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
          })()}

          {/* Detailed Editable Form */}
          <Card className="shadow-xs border border-border">
            <CardHeader>
              <CardTitle className="font-extrabold text-foreground tracking-tight">Informasi Pribadi</CardTitle>
              <CardDescription className="text-xs">Lengkapi detail profil Anda untuk keperluan verifikasi berkas.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="namaLahir" className="text-xs font-bold text-muted-foreground">Nama Lengkap Sesuai Lahir</Label>
                    <Input
                      id="namaLahir"
                      value={namaLahir}
                      onChange={(e) => setNamaLahir(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda..."
                    />
                  </div>
 
                  <div className="space-y-1.5">
                    <Label htmlFor="gelarAkademik" className="text-xs font-bold text-muted-foreground">Gelar Akademik (Gelar Belakang)</Label>
                    <Input
                      id="gelarAkademik"
                      value={gelarAkademik}
                      onChange={(e) => setGelarAkademik(e.target.value)}
                      placeholder="Contoh: S.Ked, Sp.A, A.Md"
                    />
                  </div>
 
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-xs font-bold text-muted-foreground">Jenis Kelamin</Label>
                    <Select value={gender} onValueChange={(val) => setGender(val || "L")}>
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Pilih Jenis Kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki (L)</SelectItem>
                        <SelectItem value="P">Perempuan (P)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
 
                  <div className="space-y-1.5">
                    <Label htmlFor="birthDate" className="text-xs font-bold text-muted-foreground">Tanggal Lahir</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
 
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="nomorTelepon" className="text-xs font-bold text-muted-foreground">Nomor Telepon / Handphone</Label>
                    <Input
                      id="nomorTelepon"
                      value={nomorTelepon}
                      onChange={(e) => setNomorTelepon(e.target.value)}
                      placeholder="Contoh: 081234567890"
                    />
                  </div>
 
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="alamatLengkap" className="text-xs font-bold text-muted-foreground">Alamat Lengkap</Label>
                    <textarea
                      id="alamatLengkap"
                      rows={3}
                      value={alamatLengkap}
                      onChange={(e) => setAlamatLengkap(e.target.value)}
                      placeholder="Masukkan alamat tinggal saat ini..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
 
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    type="submit"
                    disabled={saving}
                    style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
                    id="profile-save-button"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
