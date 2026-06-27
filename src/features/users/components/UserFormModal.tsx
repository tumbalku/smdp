/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserFormData, EmploymentStatusOption, ProfessionGroupOption, EmployeeRankOption, WorkplaceOption } from "../types";

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  loading: boolean;
  onSubmit: (data: UserFormData) => void;
  employmentStatuses: EmploymentStatusOption[];
  professionGroups: ProfessionGroupOption[];
  employeeRanks: EmployeeRankOption[];
  workplaces: WorkplaceOption[];
  initialData?: User | null;
}

export function UserFormModal({
  open,
  onOpenChange,
  isEdit,
  loading,
  onSubmit,
  employmentStatuses,
  professionGroups,
  employeeRanks,
  workplaces,
  initialData = null,
}: UserFormModalProps) {
  // Local Form states initialized directly from initialData
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

  // Sync inputs on open or initialData change
  useEffect(() => {
    if (open) {
      setName(isEdit && initialData ? initialData.name || "" : "");
      setEmail(isEdit && initialData ? initialData.email || "" : "");
      setPassword("");
      setEmployeeId(isEdit && initialData ? initialData.employeeId || "" : "");
      setGender(isEdit && initialData ? initialData.gender || "L" : "L");
      setBirthDate(isEdit && initialData && initialData.birthDate ? initialData.birthDate.split("T")[0] : "");
      setAgama(isEdit && initialData ? initialData.agama || "" : "");
      setPendidikanTerakhir(isEdit && initialData ? initialData.pendidikanTerakhir || "" : "");
      setRoles(isEdit && initialData ? initialData.roles || [] : ["EMPLOYEE"]);
      setEmploymentStatusId(isEdit && initialData ? initialData.employmentStatusId || "" : "");
      setEmployeeGroupId(isEdit && initialData ? initialData.employeeGroupId || "" : "");
      setProfessionGroupId(isEdit && initialData ? initialData.professionGroupId || "" : "");
      setEmployeePositionId(isEdit && initialData ? initialData.employeePositionId || "" : "");
      setEmployeeRankId(isEdit && initialData ? initialData.employeeRankId || "" : "");
      setWorkplaceId(isEdit && initialData ? initialData.workplaceId || "" : "");
      setStatusPernikahan(isEdit && initialData ? initialData.statusPernikahan || "" : "");
    }
  }, [open, isEdit, initialData]);

  const handleRoleCheckboxChange = (role: string) => {
    if (roles.includes(role)) {
      if (roles.length === 1) return; // Prevent empty roles
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    };
    if (!isEdit) {
      data.password = password;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-foreground tracking-tight">
            {isEdit ? "Edit Profil & Otorisasi Pegawai" : "Daftarkan Pegawai Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {!isEdit && (
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
              )}

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

              <div className="space-y-1.5">
                <Label htmlFor="formAgama" className="text-xs font-bold text-muted-foreground">
                  Agama
                </Label>
                <Select value={agama} onValueChange={(val) => setAgama(val || "")}>
                  <SelectTrigger id="formAgama" className="w-full text-xs">
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
                <Label htmlFor="formPendidikanTerakhir" className="text-xs font-bold text-muted-foreground">
                  Pendidikan Terakhir
                </Label>
                <Select value={pendidikanTerakhir} onValueChange={(val) => setPendidikanTerakhir(val || "")}>
                  <SelectTrigger id="formPendidikanTerakhir" className="w-full text-xs">
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
                <Label htmlFor="formStatusPernikahan" className="text-xs font-bold text-muted-foreground">
                  Status Pernikahan
                </Label>
                <Select value={statusPernikahan} onValueChange={(val) => setStatusPernikahan(val || "")}>
                  <SelectTrigger id="formStatusPernikahan" className="w-full text-xs">
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
                  <SelectTrigger id="formStatus" className="w-full text-xs">
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
                  <SelectTrigger id="formGroup" className="w-full text-xs">
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

              {/* Pangkat/Golongan */}
              <div className="space-y-1.5">
                <Label htmlFor="formRank" className="text-xs font-bold text-muted-foreground">
                  Pangkat / Golongan
                </Label>
                <Select
                  value={employeeRankId}
                  onValueChange={(val) => setEmployeeRankId(val || "")}
                >
                  <SelectTrigger id="formRank" className="w-full text-xs">
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
                  <SelectTrigger id="formWorkplace" className="w-full text-xs">
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
                  <SelectTrigger id="formProfession" className="w-full text-xs">
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
                  <SelectTrigger id="formPosition" className="w-full text-xs">
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

            {/* Roles Selector */}
            {isEdit ? (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold text-foreground block mb-1">
                  Pilih Peran Akses
                </Label>
                <div className="space-y-2">
                  {["EMPLOYEE", "STAFF", "HR_ADMIN"].map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground p-2 hover:bg-muted rounded-lg border border-transparent hover:border-border"
                    >
                      <input
                        type="checkbox"
                        checked={roles.includes(r)}
                        onChange={() => handleRoleCheckboxChange(r)}
                        className="h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary"
                      />
                      <div className="flex flex-col">
                        <span>
                          {r === "EMPLOYEE" ? "Pegawai" : r === "STAFF" ? "Staff" : "HR Admin"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium normal-case leading-none mt-0.5">
                          {r === "EMPLOYEE" &&
                            "Akses Portal Pegawai untuk unggah & kelola berkas pribadi"}
                          {r === "STAFF" && "Akses Administratif untuk tinjau berkas & audit log"}
                          {r === "HR_ADMIN" &&
                            "Akses HR penuh termasuk konfigurasi master & kelola peran"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-muted p-4 rounded-xl border border-border">
                <Label className="text-xs font-bold text-foreground block mb-1">
                  Peran Otorisasi (Pilih minimal satu)
                </Label>
                <div className="flex gap-4">
                  {["EMPLOYEE", "STAFF", "HR_ADMIN"].map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={roles.includes(r)}
                        onChange={() => handleRoleCheckboxChange(r)}
                        className="h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary"
                      />
                      {r === "EMPLOYEE" ? "Pegawai" : r === "STAFF" ? "Staff" : "HR Admin"}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? "Menyimpan..." : "Mendaftarkan..."}
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Daftarkan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
