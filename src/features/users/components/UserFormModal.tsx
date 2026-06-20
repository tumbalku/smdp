import React, { useState } from "react";
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
import { User, UserFormData, EmploymentStatusOption } from "../types";

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  loading: boolean;
  onSubmit: (data: UserFormData) => void;
  categories: EmploymentStatusOption[];
  initialData?: User | null;
}

export function UserFormModal({
  open,
  onOpenChange,
  isEdit,
  loading,
  onSubmit,
  categories,
  initialData = null,
}: UserFormModalProps) {
  // Local Form states initialized directly from initialData
  const [name, setName] = useState(() => (isEdit && initialData ? initialData.name || "" : ""));
  const [email, setEmail] = useState(() => (isEdit && initialData ? initialData.email || "" : ""));
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState(() => (isEdit && initialData ? initialData.employeeId || "" : ""));
  const [gender, setGender] = useState(() => (isEdit && initialData ? initialData.gender || "L" : "L"));
  const [birthDate, setBirthDate] = useState(() => (isEdit && initialData && initialData.birthDate ? initialData.birthDate.split("T")[0] : ""));
  const [roles, setRoles] = useState<string[]>(() => (isEdit && initialData ? initialData.roles || [] : ["EMPLOYEE"]));
  const [employmentStatusId, setEmploymentStatusId] = useState(() => (isEdit && initialData ? initialData.employmentStatusId || "" : ""));
  const [employeeGroupId, setEmployeeGroupId] = useState(() => (isEdit && initialData ? initialData.employeeGroupId || "" : ""));
  const [employeePositionId, setEmployeePositionId] = useState(() => (isEdit && initialData ? initialData.employeePositionId || "" : ""));

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
      employeePositionId: employeePositionId || null,
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
                      className="pl-9"
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
                  <SelectTrigger id="formGender">
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
                />
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
                    setEmployeePositionId("");
                  }}
                >
                  <SelectTrigger id="formStatus" className="text-xs">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kelompok Pegawai */}
              <div className="space-y-1.5">
                <Label htmlFor="formGroup" className="text-xs font-bold text-muted-foreground">
                  Kelompok Pegawai
                </Label>
                <Select
                  value={employeeGroupId}
                  onValueChange={(val) => {
                    setEmployeeGroupId(val || "");
                    setEmployeePositionId("");
                  }}
                  disabled={!employmentStatusId}
                >
                  <SelectTrigger id="formGroup" className="text-xs">
                    <SelectValue
                      placeholder={
                        employmentStatusId
                          ? "Pilih Kelompok"
                          : "Pilih Status Kepegawaian dahulu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      categories.find((c) => c.id === employmentStatusId)?.groups || []
                    ).map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profesi / Jabatan */}
              {employmentStatusId &&
              employeeGroupId &&
              (categories.find((c) => c.id === employmentStatusId)?.groups || []).find(
                (g) => g.id === employeeGroupId
              )?.positions.length ? (
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="formPosition" className="text-xs font-bold text-muted-foreground">
                    Profesi / Jabatan
                  </Label>
                  <Select
                    value={employeePositionId}
                    onValueChange={(val) => setEmployeePositionId(val || "")}
                  >
                    <SelectTrigger id="formPosition" className="text-xs">
                      <SelectValue placeholder="Pilih Profesi / Jabatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        (categories.find((c) => c.id === employmentStatusId)?.groups || [])
                          .find((g) => g.id === employeeGroupId)?.positions || []
                      ).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
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
