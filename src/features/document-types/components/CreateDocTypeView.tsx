"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { DOCUMENT_ICONS } from "../utils/icons";
import Link from "next/link";

const AVAILABLE_FORMATS = ["PDF", "JPG", "PNG", "DOCX", "XLSX", "ZIP"];

export function CreateDocTypeView() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxSize, setMaxSize] = useState(5);
  const [formats, setFormats] = useState("PDF, JPG, PNG");
  const [targetPositions, setTargetPositions] = useState<string[]>([]);
  const [isMandatory, setIsMandatory] = useState(false);
  const [requiresExpiry, setRequiresExpiry] = useState(false);
  const [icon, setIcon] = useState("FileText");
  
  const [positions, setPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  useEffect(() => {
    async function fetchPositions() {
      try {
        const res = await fetch("/api/admin/employment-categories");
        const resData = await res.json();
        if (res.ok && resData.data && resData.data.professionGroups) {
          const uniquePositions = resData.data.professionGroups
            .map((pg: any) => pg.name)
            .sort() as string[];
          setPositions(uniquePositions);
        }
      } catch (err) {
        console.error("Gagal mengambil kategori kepegawaian:", err);
      }
    }
    fetchPositions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/document-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          targetPositions: targetPositions.length > 0 ? targetPositions.join(", ") : null,
          isMandatory,
          requiresExpiryDate: requiresExpiry,
          maxSize,
          allowedFormats: formats,
          icon,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal membuat jenis dokumen.");
      }

      router.push("/admin/document-types");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat jenis dokumen.");
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="flex items-center gap-4 border-b border-border/80 pb-5">
        <Link href="/admin/document-types">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Tambah Jenis Dokumen
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Buat konfigurasi jenis dokumen baru untuk diunggah oleh pegawai.
          </p>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="newName" className="text-sm font-bold text-muted-foreground">
                Nama Dokumen
              </Label>
              <Input
                id="newName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: KTP, STR Medis, SIP"
                required
                className="max-w-md"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newDesc" className="text-sm font-bold text-muted-foreground">
                Deskripsi (Opsional)
              </Label>
              <textarea
                id="newDesc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan singkat mengenai berkas ini..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-muted-foreground">
                Pilih Ikon Dokumen
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 bg-muted p-4 rounded-xl border border-border">
                {DOCUMENT_ICONS.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = icon === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setIcon(item.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-150 gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-[#6c63ff] border-[#6c63ff] text-white shadow-xs"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                      <span className="text-[10px] font-bold tracking-tight line-clamp-1">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="newMaxSize" className="text-sm font-bold text-muted-foreground">
                  Ukuran Maksimum Berkas (MB)
                </Label>
                <Input
                  id="newMaxSize"
                  type="number"
                  value={maxSize}
                  onChange={(e) => setMaxSize(parseInt(e.target.value) || 1)}
                  min={1}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-muted-foreground">
                  Format Diizinkan
                </Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_FORMATS.map((fmt) => {
                    const activeList = formats
                      .split(",")
                      .map((f) => f.trim().toUpperCase())
                      .filter(Boolean);
                    const isActive = activeList.includes(fmt);
                    return (
                      <span
                        key={fmt}
                        onClick={() => {
                          let newList;
                          if (activeList.includes(fmt)) {
                            newList = activeList.filter((f) => f !== fmt);
                          } else {
                            newList = [...activeList, fmt];
                          }
                          if (newList.length === 0) newList = [fmt];
                          setFormats(newList.join(", "));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border select-none transition-all duration-150 ${
                          isActive
                            ? "bg-[#6c63ff] border-[#6c63ff] text-white shadow-xs"
                            : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {fmt}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-muted-foreground">
                Target Posisi (Kosongkan untuk Semua Posisi/Universal)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-muted p-4 rounded-xl border border-border">
                {positions.map((posName) => {
                  const isChecked = targetPositions.includes(posName);
                  return (
                    <div key={posName} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`new-pos-${posName}`}
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setTargetPositions(targetPositions.filter((p) => p !== posName));
                          } else {
                            setTargetPositions([...targetPositions, posName]);
                          }
                        }}
                        className="rounded border-slate-300 text-[#6c63ff] focus:ring-[#6c63ff] h-4 w-4"
                      />
                      <Label
                        htmlFor={`new-pos-${posName}`}
                        className="text-xs font-semibold text-foreground cursor-pointer"
                      >
                        {posName}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-muted p-4 rounded-xl border border-border">
                <Label htmlFor="newIsMandatory" className="text-sm font-bold text-foreground cursor-pointer">
                  Wajib Diisi (Mandatori)
                </Label>
                <Switch
                  id="newIsMandatory"
                  checked={isMandatory}
                  onCheckedChange={setIsMandatory}
                />
              </div>
              <div className="flex items-center justify-between bg-muted p-4 rounded-xl border border-border">
                <Label htmlFor="newRequiresExpiry" className="text-sm font-bold text-foreground cursor-pointer">
                  Membutuhkan Tanggal Kedaluwarsa
                </Label>
                <Switch
                  id="newRequiresExpiry"
                  checked={requiresExpiry}
                  onCheckedChange={setRequiresExpiry}
                />
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end gap-3 border-t border-border/50">
              <Link href="/admin/document-types">
                <Button type="button" variant="outline" disabled={loading}>
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
                className="font-bold min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Jenis Dokumen"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
