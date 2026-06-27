import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  formValues: {
    namaLahir: string;
    alamatLengkap: string;
    nomorTelepon: string;
    gelarAkademik: string;
    gender: string;
    birthDate: string;
    agama: string;
    pendidikanTerakhir: string;
    statusPernikahan: string;
  };
  setFormValues: React.Dispatch<React.SetStateAction<{
    namaLahir: string;
    alamatLengkap: string;
    nomorTelepon: string;
    gelarAkademik: string;
    gender: string;
    birthDate: string;
    agama: string;
    pendidikanTerakhir: string;
    statusPernikahan: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function ProfileForm({ formValues, setFormValues, onSubmit, saving }: ProfileFormProps) {
  const { namaLahir, alamatLengkap, nomorTelepon, gelarAkademik, gender, birthDate, agama, pendidikanTerakhir, statusPernikahan } = formValues;

  // ponytail: unified input state update helper
  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-xs border border-border">
      <CardHeader>
        <CardTitle className="font-extrabold text-foreground tracking-tight">Informasi Pribadi</CardTitle>
        <CardDescription className="text-xs">Lengkapi detail profil Anda untuk keperluan verifikasi berkas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="namaLahir" className="text-xs font-bold text-muted-foreground">Nama Lengkap Sesuai Lahir</Label>
              <Input
                id="namaLahir"
                value={namaLahir}
                onChange={(e) => handleChange("namaLahir", e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gelarAkademik" className="text-xs font-bold text-muted-foreground">Gelar Akademik (Gelar Belakang)</Label>
              <Input
                id="gelarAkademik"
                value={gelarAkademik}
                onChange={(e) => handleChange("gelarAkademik", e.target.value)}
                placeholder="Contoh: S.Ked, Sp.A, A.Md"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-bold text-muted-foreground">Jenis Kelamin</Label>
              <Select value={gender} onValueChange={(val) => handleChange("gender", val || "L")}>
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
                onChange={(e) => handleChange("birthDate", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agama" className="text-xs font-bold text-muted-foreground">Agama</Label>
              <Select value={agama} onValueChange={(val) => handleChange("agama", val || "")}>
                <SelectTrigger id="agama" className="w-full">
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
              <Label htmlFor="pendidikanTerakhir" className="text-xs font-bold text-muted-foreground">Pendidikan Terakhir</Label>
              <Select value={pendidikanTerakhir} onValueChange={(val) => handleChange("pendidikanTerakhir", val || "")}>
                <SelectTrigger id="pendidikanTerakhir" className="w-full">
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
              <Label htmlFor="statusPernikahan" className="text-xs font-bold text-muted-foreground">Status Pernikahan</Label>
              <Select value={statusPernikahan} onValueChange={(val) => handleChange("statusPernikahan", val || "")}>
                <SelectTrigger id="statusPernikahan" className="w-full">
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

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="nomorTelepon" className="text-xs font-bold text-muted-foreground">Nomor Telepon / Handphone</Label>
              <Input
                id="nomorTelepon"
                value={nomorTelepon}
                onChange={(e) => handleChange("nomorTelepon", e.target.value)}
                placeholder="Contoh: 081234567890"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="alamatLengkap" className="text-xs font-bold text-muted-foreground">Alamat Lengkap</Label>
              <textarea
                id="alamatLengkap"
                rows={3}
                value={alamatLengkap}
                onChange={(e) => handleChange("alamatLengkap", e.target.value)}
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
  );
}
