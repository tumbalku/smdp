"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmploymentStatusOption,
  ProfessionGroupOption,
  EmployeeRankOption,
  WorkplaceOption,
  UserFormData,
} from "../types";

export function CreateUserView() {
  const router = useRouter();

  // Local Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [gender, setGender] = useState("L");
  const [birthDate, setBirthDate] = useState("");
  const [agama, setAgama] = useState("");
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState("");
  const [roles, setRoles] = useState<string[]>(["EMPLOYEE"]);
  const [employmentStatusId, setEmploymentStatusId] = useState("");
  const [employeeGroupId, setEmployeeGroupId] = useState("");
  const [professionGroupId, setProfessionGroupId] = useState("");
  const [employeePositionId, setEmployeePositionId] = useState("");
  const [employeeRankId, setEmployeeRankId] = useState("");
  const [workplaceId, setWorkplaceId] = useState("");
  const [statusPernikahan, setStatusPernikahan] = useState("");

  // Categories states
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatusOption[]>([]);
  const [professionGroups, setProfessionGroups] = useState<ProfessionGroupOption[]>([]);
  const [employeeRanks, setEmployeeRanks] = useState<EmployeeRankOption[]>([]);
  const [workplaces, setWorkplaces] = useState<WorkplaceOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/employment-categories");
        const resData = await res.json();
        if (res.ok && resData.success && resData.data) {
          setEmploymentStatuses(resData.data.employmentStatuses || []);
          setProfessionGroups(resData.data.professionGroups || []);
          setEmployeeRanks(resData.data.employeeRanks || []);
          setWorkplaces(resData.data.workplaces || []);
        }
      } catch (err) {
        console.error("Gagal memuat kategori kepegawaian:", err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleRoleCheckboxChange = (role: string) => {
    if (roles.includes(role)) {
      if (roles.length === 1) return; // Prevent empty roles
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const data: UserFormData = {
      name,
      email,
      employeeId,
      gender,
      birthDate: birthDate || null,
      roles,
      employmentStatusId: employmentStatusId || null,
      employeeGroupId: employeeGroupId || null,
      professionGroupId: professionGroupId || null,
      employeePositionId: employeePositionId || null,
      employeeRankId: employeeRankId || null,
      workplaceId: workplaceId || null,
      agama: agama || null,
      pendidikanTerakhir: pendidikanTerakhir || null,
      statusPernikahan: statusPernikahan || null,
      password,
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal mendaftarkan pegawai.");
      }

      // Redirect back to user list page
      router.push("/admin/users");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan saat mendaftarkan pegawai.");
      setSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#6c63ff] animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat parameter formulir kepegawaian...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn max-w-7xl mx-auto" id="create-user-page-container">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/80 pb-5 mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Tambah Pegawai Baru
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Daftarkan pegawai baru dan konfigurasikan status kepegawaian serta otorisasi perannya.
          </p>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <Label htmlFor="formName" className="text-xs font-bold text-muted-foreground">
                  Nama Lengkap *
                </Label>
                <Input
                  id="formName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: dr. John Doe"
                  required
                />
              </div>

              {/* NIP */}
              <div className="space-y-1.5">
                <Label htmlFor="formEmployeeId" className="text-xs font-bold text-muted-foreground">
                  NIP (Nomor Induk Pegawai) *
                </Label>
                <Input
                  id="formEmployeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Contoh: 198804122015031002"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="formEmail" className="text-xs font-bold text-muted-foreground">
                  Email Utama *
                </Label>
                <Input
                  id="formEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: john.doe@smdp.local"
                  required
                />
              </div>

              {/* Kata Sandi Awal */}
              <div className="space-y-1.5">
                <Label htmlFor="formPassword" className="text-xs font-bold text-muted-foreground">
                  Kata Sandi Awal *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="formPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 Karakter"
                    className="pl-9 w-full"
                    required
                  />
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <Label htmlFor="formGender" className="text-xs font-bold text-muted-foreground">
                  Jenis Kelamin
                </Label>
                <Select value={gender} onValueChange={(val) => setGender(val || "L")}>
                  <SelectTrigger id="formGender" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki (L)</SelectItem>
                    <SelectItem value="P">Perempuan (P)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Lahir */}
              <div className="space-y-1.5">
                <Label htmlFor="formBirthDate" className="text-xs font-bold text-muted-foreground">
                  Tanggal Lahir
                </Label>
                <Input
                  id="formBirthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Agama */}
              <div className="space-y-1.5">
                <Label htmlFor="formAgama" className="text-xs font-bold text-muted-foreground">
                  Agama
                </Label>
                <Select value={agama} onValueChange={(val) => setAgama(val || "")}>
                  <SelectTrigger id="formAgama" className="w-full">
                    <SelectValue placeholder="Pilih Agama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Islam">Islam</SelectItem>
                    <SelectItem value="Kristen Protestan">Kristen Protestan</SelectItem>
                    <SelectItem value="Kristen Katolik">Kristen Katolik</SelectItem>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Buddha">Buddha</SelectItem>
                    <SelectItem value="Khonghucu">Khonghucu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pendidikan Terakhir */}
              <div className="space-y-1.5">
                <Label htmlFor="formPendidikanTerakhir" className="text-xs font-bold text-muted-foreground">
                  Pendidikan Terakhir
                </Label>
                <Select value={pendidikanTerakhir} onValueChange={(val) => setPendidikanTerakhir(val || "")}>
                  <SelectTrigger id="formPendidikanTerakhir" className="w-full">
                    <SelectValue placeholder="Pilih Pendidikan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SD">SD</SelectItem>
                    <SelectItem value="SMP">SMP</SelectItem>
                    <SelectItem value="SMA / SMK">SMA / SMK</SelectItem>
                    <SelectItem value="D1">D1</SelectItem>
                    <SelectItem value="D2">D2</SelectItem>
                    <SelectItem value="D3">D3</SelectItem>
                    <SelectItem value="D4 / S1">D4 / S1</SelectItem>
                    <SelectItem value="S2">S2</SelectItem>
                    <SelectItem value="S3">S3</SelectItem>
                    <SelectItem value="Sp-1">Sp-1</SelectItem>
                    <SelectItem value="Sp-2">Sp-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Pernikahan */}
              <div className="space-y-1.5">
                <Label htmlFor="formStatusPernikahan" className="text-xs font-bold text-muted-foreground">
                  Status Pernikahan
                </Label>
                <Select value={statusPernikahan} onValueChange={(val) => setStatusPernikahan(val || "")}>
                  <SelectTrigger id="formStatusPernikahan" className="w-full">
                    <SelectValue placeholder="Pilih Status Pernikahan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                    <SelectItem value="Kawin">Kawin</SelectItem>
                    <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                    <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Kepegawaian */}
              <div className="space-y-1.5">
                <Label htmlFor="formStatus" className="text-xs font-bold text-muted-foreground">
                  Status Kepegawaian
                </Label>
                <Select
                  value={employmentStatusId}
                  onValueChange={(val) => {
                    setEmploymentStatusId(val || "");
                    setEmployeeGroupId("");
                  }}
                >
                  <SelectTrigger id="formStatus" className="w-full">
                    <SelectValue placeholder="Pilih Status">
                      {employmentStatuses.find((c) => c.id === employmentStatusId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {employmentStatuses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Jenis Kepegawaian */}
              <div className="space-y-1.5">
                <Label htmlFor="formGroup" className="text-xs font-bold text-muted-foreground">
                  Jenis Kepegawaian
                </Label>
                <Select
                  value={employeeGroupId}
                  onValueChange={(val) => {
                    setEmployeeGroupId(val || "");
                  }}
                  disabled={!employmentStatusId}
                >
                  <SelectTrigger id="formGroup" className="w-full">
                    <SelectValue
                      placeholder={
                        employmentStatusId
                          ? "Pilih Jenis"
                          : "Pilih Status dahulu"
                      }
                    >
                      {
                        (employmentStatuses.find((c) => c.id === employmentStatusId)?.groups || [])
                          .find((g) => g.id === employeeGroupId)?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      employmentStatuses.find((c) => c.id === employmentStatusId)?.groups || []
                    ).map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pangkat / Golongan */}
              <div className="space-y-1.5">
                <Label htmlFor="formRank" className="text-xs font-bold text-muted-foreground">
                  Pangkat / Golongan
                </Label>
                <Select
                  value={employeeRankId}
                  onValueChange={(val) => setEmployeeRankId(val || "")}
                >
                  <SelectTrigger id="formRank" className="w-full">
                    <SelectValue placeholder="Pilih Pangkat/Golongan">
                      {employeeRanks.find((r) => r.id === employeeRankId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {employeeRanks.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tempat Tugas */}
              <div className="space-y-1.5">
                <Label htmlFor="formWorkplace" className="text-xs font-bold text-muted-foreground">
                  Tempat Tugas
                </Label>
                <Select
                  value={workplaceId}
                  onValueChange={(val) => setWorkplaceId(val || "")}
                >
                  <SelectTrigger id="formWorkplace" className="w-full">
                    <SelectValue placeholder="Pilih Tempat Tugas">
                      {workplaces.find((w) => w.id === workplaceId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {workplaces.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kelompok Profesi */}
              <div className="space-y-1.5">
                <Label htmlFor="formProfession" className="text-xs font-bold text-muted-foreground">
                  Kelompok Profesi
                </Label>
                <Select
                  value={professionGroupId}
                  onValueChange={(val) => {
                    setProfessionGroupId(val || "");
                    setEmployeePositionId("");
                  }}
                >
                  <SelectTrigger id="formProfession" className="w-full">
                    <SelectValue placeholder="Pilih Kelompok Profesi">
                      {professionGroups.find((pg) => pg.id === professionGroupId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {professionGroups.map((pg) => (
                      <SelectItem key={pg.id} value={pg.id}>
                        {pg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Jabatan */}
              <div className="space-y-1.5">
                <Label htmlFor="formPosition" className="text-xs font-bold text-muted-foreground">
                  Jabatan
                </Label>
                <Select
                  value={employeePositionId}
                  onValueChange={(val) => setEmployeePositionId(val || "")}
                  disabled={!professionGroupId}
                >
                  <SelectTrigger id="formPosition" className="w-full">
                    <SelectValue
                      placeholder={
                        professionGroupId
                          ? "Pilih Jabatan"
                          : "Pilih Kelompok dahulu"
                      }
                    >
                      {
                        (professionGroups.find((pg) => pg.id === professionGroupId)?.positions || [])
                          .find((pos) => pos.id === employeePositionId)?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      professionGroups.find((pg) => pg.id === professionGroupId)?.positions || []
                    ).map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Peran Otorisasi */}
            <div className="space-y-2 bg-muted p-5 rounded-2xl border border-border">
              <Label className="text-xs font-bold text-foreground block mb-2">
                Peran Otorisasi Akses Sistem (Pilih minimal satu)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["EMPLOYEE", "STAFF", "HR_ADMIN"].map((r) => (
                  <label
                    key={r}
                    className="flex items-start gap-3 cursor-pointer text-xs font-bold text-foreground p-3 bg-card rounded-xl border border-border hover:border-[#6c63ff]/50 hover:bg-muted/50 transition-all duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={roles.includes(r)}
                      onChange={() => handleRoleCheckboxChange(r)}
                      className="h-4 w-4 rounded-sm border-slate-300 text-[#6c63ff] focus:ring-[#6c63ff] mt-0.5"
                    />
                    <div className="flex flex-col">
                      <span>
                        {r === "EMPLOYEE" ? "Pegawai" : r === "STAFF" ? "Staff" : "HR Admin"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium normal-case mt-1 leading-relaxed">
                        {r === "EMPLOYEE" &&
                          "Akses Portal Pegawai untuk unggah & kelola berkas pribadi"}
                        {r === "STAFF" &&
                          "Akses Administratif untuk tinjau berkas & audit log"}
                        {r === "HR_ADMIN" &&
                          "Akses HR penuh termasuk konfigurasi master & kelola peran"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="pt-6 flex items-center justify-end gap-3 border-t border-border/50">
              <Link href="/admin/users">
                <Button type="button" variant="outline" disabled={submitting}>
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
                className="font-bold min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  "Daftarkan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
