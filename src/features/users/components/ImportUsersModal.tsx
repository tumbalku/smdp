/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Info,
  ChevronRight,
} from "lucide-react";

interface ImportError {
  row: number;
  nip?: string;
  email?: string;
  message: string;
}

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

export function ImportUsersModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportUsersModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  // Reset state when modal is opened or closed
  useEffect(() => {
    if (open) {
      setFile(null);
      setError("");
      setResult(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError("");
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Berkas harus berupa file CSV (.csv).");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/users/import", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Terjadi kesalahan saat mengimpor data.");
      }

      setResult(json.data);
      if (json.data.successCount > 0) {
        onImportSuccess();
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-extrabold text-foreground tracking-tight flex items-center gap-2 text-xl">
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            Impor Pegawai Massal via CSV
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4 text-sm scrollbar-thin">
          {!result ? (
            <form onSubmit={handleImport} className="space-y-4">
              {/* Instructions */}
              <div className="bg-muted/60 dark:bg-muted/30 border border-border rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                  <span>Panduan Struktur Kolom CSV</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Berkas CSV wajib menggunakan baris pertama sebagai header dengan nama kolom yang tepat (huruf kecil):
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono bg-background p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>nama <span className="text-red-500">*</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>nip <span className="text-red-500">*</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>email <span className="text-red-500">*</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>gender <span className="text-[10px] text-muted-foreground">(L/P)</span></span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>tanggal_lahir <span className="text-[10px] text-muted-foreground">(YYYY-MM-DD)</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>status_kepegawaian</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>jenis_kepegawaian</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>kelompok_profesi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>jabatan</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>peran <span className="text-[10px] text-muted-foreground">(EMPLOYEE / STAFF / HR_ADMIN)</span></span>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 leading-normal">
                    Password akun akan dibuat secara otomatis dengan nilai default: <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold text-amber-900 dark:text-amber-300">pegawai123</code>.
                  </p>
                </div>
              </div>

              {/* Template Download */}
              <div className="flex justify-between items-center bg-card rounded-xl p-3 border border-border">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Gunakan Template CSV</h4>
                  <p className="text-[11px] text-muted-foreground">Unduh berkas kosong yang telah diformat agar meminimalisir kesalahan.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-bold flex items-center gap-1.5 shrink-0"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "/smdp_template_import.csv";
                    link.setAttribute("download", "smdp_template_import.csv");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Template CSV
                </Button>
              </div>

              {/* File input */}
              <div className="space-y-2">
                <Label htmlFor="csvFile" className="text-xs font-extrabold text-muted-foreground">
                  Pilih Berkas CSV *
                </Label>
                <div className="relative border-2 border-dashed border-border hover:border-emerald-500 rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer bg-muted/20 dark:bg-muted/10 group">
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-emerald-500 transition-colors mb-2" />
                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-foreground max-w-[400px] truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti berkas
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Seret & taruh file di sini atau klik untuk memilih berkas</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Mendukung format .csv</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error indicator */}
              {error && (
                <Alert variant="destructive" className="py-2.5">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="shrink-0 pt-3 border-t border-border gap-2">
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
                  disabled={loading || !file}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses Impor...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Impor Pegawai
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            /* Results Presentation */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border flex gap-3.5 items-start bg-card">
                {result.errorCount === 0 ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                ) : result.successCount > 0 ? (
                  <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500 shrink-0" />
                )}
                <div>
                  <h3 className="font-extrabold text-foreground text-base">Hasil Impor Pegawai</h3>
                  <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                    Proses parsing dan pendaftaran pegawai selesai dilaksanakan.
                  </p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                      Berhasil: {result.successCount}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      result.errorCount > 0
                        ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                        : "text-muted-foreground bg-muted border-border"
                    }`}>
                      Gagal: {result.errorCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error list console */}
              {result.errorCount > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold text-muted-foreground uppercase flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Rincian Baris yang Gagal / Error
                  </Label>
                  <div className="bg-slate-900 dark:bg-black border border-slate-800 dark:border-slate-950 rounded-xl p-3.5 font-mono text-[11.5px] leading-relaxed text-red-400 max-h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-slate-400 font-semibold">
                          {err.row > 0 ? `Baris ${err.row}: ` : "Database: "}
                        </span>
                        <span>{err.message}</span>
                        {(err.nip || err.email) && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {err.nip && <span>NIP: {err.nip}</span>}
                            {err.nip && err.email && <span className="mx-1">•</span>}
                            {err.email && <span>Email: {err.email}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="shrink-0 pt-3 border-t border-border">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
                >
                  Selesai
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
