"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2, UserPen } from "lucide-react";
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
} from "../types";

interface EditUserViewProps {
  userId: string;
}

export function EditUserView({ userId }: EditUserViewProps) {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  // Page states
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userName, setUserName] = useState("");

  // Fetch categories and user data on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        const [categoriesRes, usersRes] = await Promise.all([
          fetch("/api/admin/employment-categories"),
          fetch("/api/admin/users"),
        ]);

        const categoriesData = await categoriesRes.json();
        if (categoriesRes.ok && categoriesData.success && categoriesData.data) {
          setEmploymentStatuses(categoriesData.data.employmentStatuses || []);
          setProfessionGroups(categoriesData.data.professionGroups || []);
          setEmployeeRanks(categoriesData.data.employeeRanks || []);
          setWorkplaces(categoriesData.data.workplaces || []);
        }
        setLoadingCategories(false);

        const usersData = await usersRes.json();
        if (usersRes.ok && usersData.users) {
          const user = usersData.users.find((u: { id: string }) => u.id === userId);
          if (!user) {
            setErrorMsg("Data pegawai tidak ditemukan. Mungkin sudah dihapus.");
            setLoadingUser(false);
            return;
          }
          setUserName(user.name || "");
          setName(user.name || "");
          setEmail(user.email || "");
          setEmployeeId(user.employeeId || "");
          setGender(user.gender || "L");
          setBirthDate(user.birthDate ? user.birthDate.split("T")[0] : "");
          setAgama(user.agama || "");
          setPendidikanTerakhir(user.pendidikanTerakhir || "");
          setStatusPernikahan(user.statusPernikahan || "");
          setRoles(user.roles && user.roles.length > 0 ? user.roles : ["EMPLOYEE"]);
          setEmploymentStatusId(user.employmentStatusId || "");
          setEmployeeGroupId(user.employeeGroupId || "");
          setProfessionGroupId(user.professionGroupId || "");
          setEmployeePositionId(user.employeePositionId || "");
          setEmployeeRankId(user.employeeRankId || "");
          setWorkplaceId(user.workplaceId || "");
        } else {
          setErrorMsg("Gagal memuat daftar pegawai.");
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setErrorMsg("Gagal menghubungkan ke server.");
      } finally {
        setLoadingUser(false);
      }
    }
    fetchAll();
  }, [userId]);

  const handleRoleCheckboxChange = (role: string) => {
    if (roles.includes(role)) {
      if (roles.length === 1) return;
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const payload = {
        id: userId,
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
      };

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal memperbarui data pegawai.");
      }

      router.push(
        `/users?success=${encodeURIComponent(`Data pegawai "${name}" berhasil diperbarui.`)}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan perubahan.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loadingUser || loadingCategories;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Memuat data pegawai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/users" passHref>
            <Button variant="outline" size="sm" className="h-9 font-bold text-xs gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <UserPen className="w-7 h-7 text-primary" />
              Edit Pegawai
            </h1>
            <p className="text-xs font-bold text-muted-foreground mt-1">
              Memperbarui profil dan otorisasi akun:{" "}
              <span className="text-foreground">{userName}</span>
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Dasar */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-extrabold text-foreground">Identitas Diri</CardTitle>
            <CardDescription className="text-xs">
              Informasi dasar dan data kependudukan pegawai.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="editName" className="text-xs font-bold text-muted-foreground">
                  Nama Lengkap *
                </Label>
                <Input
                  id="editName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: dr. John Doe"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEmployeeId" className="text-xs font-bold text-muted-foreground">
                  NIP (Nomor Induk Pegawai) *
                </Label>
                <Input
                  id="editEmployeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Contoh: 198804122015031002"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEmail" className="text-xs font-bold text-muted-foreground">
                  Email Utama *
                </Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: john.doe@smdp.local"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editGender" className="text-xs font-bold text-muted-foreground">
                  Jenis Kelamin
                </Label>
                <Select value={gender} onValueChange={(val) => setGender(val || "L")}>
                  <SelectTrigger id="editGender" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki (L)</SelectItem>
                    <SelectItem value="P">Perempuan (P)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editBirthDate" className="text-xs font-bold text-muted-foreground">
                  Tanggal Lahir
                </Label>
                <Input
                  id="editBirthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editAgama" className="text-xs font-bold text-muted-foreground">
                  Agama
                </Label>
                <Select value={agama} onValueChange={(val) => setAgama(val || "")}>
                  <SelectTrigger id="editAgama" className="w-full text-xs">
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

              <div className="space-y-1.5">
                <Label htmlFor="editPendidikan" className="text-xs font-bold text-muted-foreground">
                  Pendidikan Terakhir
                </Label>
                <Select
                  value={pendidikanTerakhir}
                  onValueChange={(val) => setPendidikanTerakhir(val || "")}
                >
                  <SelectTrigger id="editPendidikan" className="w-full text-xs">
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

              <div className="space-y-1.5">
                <Label htmlFor="editStatusPernikahan" className="text-xs font-bold text-muted-foreground">
                  Status Pernikahan
                </Label>
                <Select
                  value={statusPernikahan}
                  onValueChange={(val) => setStatusPernikahan(val || "")}
                >
                  <SelectTrigger id="editStatusPernikahan" className="w-full text-xs">
                    <SelectValue placeholder="Pilih Status Pernikahan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                    <SelectItem value="Kawin">Kawin</SelectItem>
                    <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                    <SelectItem value="Cerai Meninggal">Cerai Meninggal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Kepegawaian */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-extrabold text-foreground">
              Data Kepegawaian
            </CardTitle>
            <CardDescription className="text-xs">
              Status, golongan, jabatan, dan tempat tugas pegawai.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="editStatus" className="text-xs font-bold text-muted-foreground">
                  Status Kepegawaian
                </Label>
                <Select
                  value={employmentStatusId}
                  onValueChange={(val) => {
                    setEmploymentStatusId(val || "");
                    setEmployeeGroupId("");
                  }}
                >
                  <SelectTrigger id="editStatus" className="w-full text-xs">
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

              <div className="space-y-1.5">
                <Label htmlFor="editGroup" className="text-xs font-bold text-muted-foreground">
                  Jenis Kepegawaian
                </Label>
                <Select
                  value={employeeGroupId}
                  onValueChange={(val) => setEmployeeGroupId(val || "")}
                  disabled={!employmentStatusId}
                >
                  <SelectTrigger id="editGroup" className="w-full text-xs">
                    <SelectValue
                      placeholder={employmentStatusId ? "Pilih Jenis" : "Pilih Status dahulu"}
                    >
                      {(
                        employmentStatuses.find((c) => c.id === employmentStatusId)?.groups || []
                      ).find((g) => g.id === employeeGroupId)?.name}
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

              <div className="space-y-1.5">
                <Label htmlFor="editRank" className="text-xs font-bold text-muted-foreground">
                  Pangkat / Golongan
                </Label>
                <Select
                  value={employeeRankId}
                  onValueChange={(val) => setEmployeeRankId(val || "")}
                >
                  <SelectTrigger id="editRank" className="w-full text-xs">
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

              <div className="space-y-1.5">
                <Label htmlFor="editWorkplace" className="text-xs font-bold text-muted-foreground">
                  Tempat Tugas
                </Label>
                <Select
                  value={workplaceId}
                  onValueChange={(val) => setWorkplaceId(val || "")}
                >
                  <SelectTrigger id="editWorkplace" className="w-full text-xs">
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

              <div className="space-y-1.5">
                <Label htmlFor="editProfession" className="text-xs font-bold text-muted-foreground">
                  Kelompok Profesi
                </Label>
                <Select
                  value={professionGroupId}
                  onValueChange={(val) => {
                    setProfessionGroupId(val || "");
                    setEmployeePositionId("");
                  }}
                >
                  <SelectTrigger id="editProfession" className="w-full text-xs">
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

              <div className="space-y-1.5">
                <Label htmlFor="editPosition" className="text-xs font-bold text-muted-foreground">
                  Jabatan
                </Label>
                <Select
                  value={employeePositionId}
                  onValueChange={(val) => setEmployeePositionId(val || "")}
                  disabled={!professionGroupId}
                >
                  <SelectTrigger id="editPosition" className="w-full text-xs">
                    <SelectValue
                      placeholder={professionGroupId ? "Pilih Jabatan" : "Pilih Kelompok dahulu"}
                    >
                      {(
                        professionGroups.find((pg) => pg.id === professionGroupId)?.positions || []
                      ).find((pos) => pos.id === employeePositionId)?.name}
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
          </CardContent>
        </Card>

        {/* Peran Otorisasi */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-extrabold text-foreground">Peran Otorisasi</CardTitle>
            <CardDescription className="text-xs">
              Tentukan hak akses sistem yang dimiliki pegawai ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  role: "EMPLOYEE",
                  label: "Pegawai",
                  desc: "Akses Portal Pegawai untuk unggah & kelola berkas pribadi",
                },
                {
                  role: "STAFF",
                  label: "Staff",
                  desc: "Akses Administratif untuk tinjau berkas & audit log",
                },
                {
                  role: "HR_ADMIN",
                  label: "HR Admin",
                  desc: "Akses HR penuh termasuk konfigurasi master & kelola peran",
                },
              ].map(({ role, label, desc }) => (
                <label
                  key={role}
                  className={`flex items-start gap-3 cursor-pointer text-xs font-bold p-4 rounded-xl border transition-all ${
                    roles.includes(role)
                      ? "bg-[#6c63ff]/5 border-[#6c63ff]/30 text-[#6c63ff]"
                      : "bg-muted/40 border-border text-foreground hover:border-[#6c63ff]/20 hover:bg-[#6c63ff]/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => handleRoleCheckboxChange(role)}
                    className="h-4 w-4 mt-0.5 rounded-sm border-slate-300 text-primary focus:ring-primary shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold">{label}</span>
                    <span className="text-[10px] text-muted-foreground font-medium normal-case leading-tight mt-0.5">
                      {desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <Link href="/users" passHref>
            <Button
              type="button"
              variant="outline"
              className="font-bold text-xs"
              disabled={submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Batal & Kembali
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="font-bold text-xs bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white gap-1.5 px-8"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
