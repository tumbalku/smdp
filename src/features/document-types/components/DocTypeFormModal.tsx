/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DOCUMENT_ICONS } from "../utils/icons";

interface DocTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (data: {
    name: string;
    description: string;
    maxSize: number;
    formats: string;
    targetPositions: string[];
    isMandatory: boolean;
    requiresExpiry: boolean;
    icon: string;
  }) => void;
  positions: string[];
}

const AVAILABLE_FORMATS = ["PDF", "JPG", "PNG", "DOCX", "XLSX", "ZIP"];

export function DocTypeFormModal({
  open,
  onOpenChange,
  loading,
  onSubmit,
  positions,
}: DocTypeFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxSize, setMaxSize] = useState(5);
  const [formats, setFormats] = useState("PDF, JPG, PNG");
  const [targetPositions, setTargetPositions] = useState<string[]>([]);
  const [isMandatory, setIsMandatory] = useState(false);
  const [requiresExpiry, setRequiresExpiry] = useState(false);
  const [icon, setIcon] = useState("FileText");

  // reset form inputs when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setMaxSize(5);
      setFormats("PDF, JPG, PNG");
      setTargetPositions([]);
      setIsMandatory(false);
      setRequiresExpiry(false);
      setIcon("FileText");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      maxSize,
      formats,
      targetPositions,
      isMandatory,
      requiresExpiry,
      icon,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-foreground tracking-tight">
            Tambah Jenis Dokumen Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newName" className="text-xs font-bold text-muted-foreground">
                Nama Dokumen
              </Label>
              <Input
                id="newName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: KTP, STR Medis, SIP"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newDesc" className="text-xs font-bold text-muted-foreground">
                Deskripsi (Opsional)
              </Label>
              <textarea
                id="newDesc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan singkat mengenai berkas ini..."
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                Pilih Ikon Dokumen
              </Label>
              <div className="grid grid-cols-4 gap-2 bg-muted p-3 md:p-3.5 rounded-xl border border-border max-h-[160px] overflow-y-auto">
                {DOCUMENT_ICONS.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = icon === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setIcon(item.value)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-150 gap-1 cursor-pointer ${
                        isActive
                          ? "bg-[#6c63ff] border-[#6c63ff] text-white shadow-xs"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-[9px] font-bold tracking-tight line-clamp-1">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newMaxSize" className="text-xs font-bold text-muted-foreground">
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
              <Label className="text-xs font-bold text-muted-foreground">
                Format Diizinkan (Pilih format yang diperbolehkan)
              </Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                Target Posisi (Kosongkan untuk Semua Posisi/Universal)
              </Label>
              <div className="grid grid-cols-2 gap-2 bg-muted p-3.5 rounded-xl border border-border">
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

            <div className="space-y-3 bg-muted p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="newIsMandatory" className="text-xs font-bold text-foreground cursor-pointer">
                  Wajib Diisi (Mandatori)
                </Label>
                <Switch
                  id="newIsMandatory"
                  checked={isMandatory}
                  onCheckedChange={setIsMandatory}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="newRequiresExpiry" className="text-xs font-bold text-foreground cursor-pointer">
                  Membutuhkan Tanggal Kedaluwarsa
                </Label>
                <Switch
                  id="newRequiresExpiry"
                  checked={requiresExpiry}
                  onCheckedChange={setRequiresExpiry}
                />
              </div>
            </div>
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
              style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Membuat...
                </>
              ) : (
                "Tambah"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
