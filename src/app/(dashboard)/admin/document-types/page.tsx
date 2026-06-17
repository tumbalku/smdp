"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Info,
  ChevronDown,
} from "lucide-react";

interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  targetPositions: string | null;
  isMandatory: boolean;
  requiresExpiryDate: boolean;
  maxSize: number;
  allowedFormats: string;
}

const AVAILABLE_FORMATS = ["PDF", "JPG", "PNG", "DOCX", "XLSX", "ZIP"];

export default function DocumentTypesPage() {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [editedTypes, setEditedTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTargetPositions, setNewTargetPositions] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [newIsMandatory, setNewIsMandatory] = useState(false);
  const [newRequiresExpiry, setNewRequiresExpiry] = useState(false);
  const [newMaxSize, setNewMaxSize] = useState(5);
  const [newFormats, setNewFormats] = useState("PDF, JPG, PNG");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/document-types");
      const resData = await res.json();
      if (res.ok) {
        setTypes(resData.data || []);
        // Clone for inline editing
        setEditedTypes(JSON.parse(JSON.stringify(resData.data || [])));
      } else {
        throw new Error(resData.error?.message || "Gagal memuat jenis dokumen.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await fetch("/api/admin/employment-categories");
      const resData = await res.json();
      if (res.ok && resData.data) {
        const uniquePositions = Array.from(
          new Set(
            resData.data.flatMap((status: any) =>
              status.groups.flatMap((group: any) =>
                group.positions.map((pos: any) => pos.name)
              )
            )
          )
        ).sort() as string[];
        setPositions(uniquePositions);
      }
    } catch (err) {
      console.error("Gagal mengambil kategori kepegawaian:", err);
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchPositions();
  }, []);

  const handleFieldChange = (id: string, field: keyof DocumentType, value: any) => {
    setEditedTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleFormatToggle = (typeId: string, format: string, currentFormatsStr: string) => {
    const currentList = currentFormatsStr
      .split(",")
      .map((f) => f.trim().toUpperCase())
      .filter(Boolean);
    let newList;
    if (currentList.includes(format)) {
      newList = currentList.filter((f) => f !== format);
    } else {
      newList = [...currentList, format];
    }
    if (newList.length === 0) newList = [format];
    handleFieldChange(typeId, "allowedFormats", newList.join(", "));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/document-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedTypes),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal menyimpan perubahan.");
      }

      setSuccessMsg("Semua konfigurasi berhasil diperbarui.");
      fetchTypes();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreateLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/document-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          targetPositions: newTargetPositions.length > 0 ? newTargetPositions.join(", ") : null,
          isMandatory: newIsMandatory,
          requiresExpiryDate: newRequiresExpiry,
          maxSize: newMaxSize,
          allowedFormats: newFormats,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal membuat jenis dokumen.");
      }

      setSuccessMsg(`Jenis dokumen "${newName}" berhasil ditambahkan.`);
      setCreateOpen(false);
      // Reset form
      setNewName("");
      setNewDesc("");
      setNewTargetPositions([]);
      setNewIsMandatory(false);
      setNewRequiresExpiry(false);
      setNewMaxSize(5);
      setNewFormats("PDF, JPG, PNG");

      fetchTypes();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat jenis dokumen.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jenis dokumen "${name}"?`)) {
      return;
    }

    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/document-types/${id}`, {
        method: "DELETE",
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal menghapus jenis dokumen.");
      }

      setSuccessMsg(`Jenis dokumen "${name}" berhasil dihapus.`);
      fetchTypes();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus jenis dokumen.");
    }
  };

  const isChanged = JSON.stringify(types) !== JSON.stringify(editedTypes);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data konfigurasi master...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="document-types-page-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Konfigurasi Jenis Dokumen</h1>
          <p className="text-xs font-bold text-muted-foreground mt-1">
            Kelola spesifikasi teknis, aturan kedaluwarsa, dan status mandatori berkas kepegawaian.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            onClick={() => setCreateOpen(true)}
            className="font-bold text-xs flex items-center gap-1.5"
            style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
          >
            <Plus className="w-4 h-4" />
            Tambah Jenis Dokumen
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!isChanged || saving}
            className="font-bold text-xs flex items-center gap-1.5"
            style={{
              backgroundColor: isChanged && !saving ? "var(--jobster-success, #22c55e)" : "var(--border)",
              color: isChanged && !saving ? "#fff" : "var(--muted-foreground)",
            }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-700">
          <CheckCircle2 className="h-4 w-4" style={{ color: "var(--jobster-success, #22c55e)" }} />
          <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {isChanged && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <Info className="h-4 w-4" style={{ color: "var(--jobster-warning, #f59e0b)" }} />
          <AlertDescription className="text-xs font-semibold">
            Terdapat perubahan konfigurasi yang belum disimpan. Klik tombol <strong>Simpan Perubahan</strong> di atas untuk menerapkan.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Table Card */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-0 overflow-x-auto">
          {editedTypes.length === 0 ? (
            <div className="text-center py-10 font-semibold text-xs text-muted-foreground">
              Belum ada jenis dokumen terdaftar.
            </div>
          ) : (
            <Table className="table-fixed w-full min-w-[1080px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-xs w-[160px]">Nama Dokumen</TableHead>
                  <TableHead className="font-bold text-xs w-[240px]">Deskripsi</TableHead>
                  <TableHead className="font-bold text-xs w-[110px]">Batas Ukuran</TableHead>
                  <TableHead className="font-bold text-xs w-[170px]">Format Diizinkan</TableHead>
                  <TableHead className="font-bold text-xs w-[160px]">Target Posisi</TableHead>
                  <TableHead className="font-bold text-xs text-center w-[80px]">Mandatori</TableHead>
                  <TableHead className="font-bold text-xs text-center w-[100px]">Masa Berlaku</TableHead>
                  <TableHead className="font-bold text-xs text-right w-[60px]">Hapus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedTypes.map((type) => (
                  <TableRow key={type.id} className="hover:bg-muted/50">
                    <TableCell className="align-middle">
                      <Input
                        value={type.name}
                        onChange={(e) => handleFieldChange(type.id, "name", e.target.value)}
                        className="font-extrabold text-xs h-8 text-foreground bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="align-middle">
                      <Input
                        value={type.description || ""}
                        onChange={(e) => handleFieldChange(type.id, "description", e.target.value)}
                        placeholder="Deskripsi singkat..."
                        className="text-xs h-8 text-muted-foreground bg-transparent font-medium"
                      />
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={type.maxSize}
                          onChange={(e) => handleFieldChange(type.id, "maxSize", parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-xs font-bold text-foreground bg-transparent text-center"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">MB</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-left font-semibold text-xs justify-between h-9 py-1"
                            >
                              <div className="flex flex-row items-center gap-1 overflow-hidden">
                                {(() => {
                                  const activeFormats = type.allowedFormats
                                    .split(",")
                                    .map((f) => f.trim().toUpperCase())
                                    .filter(Boolean);
                                  const displayFormats = activeFormats.slice(0, 3);
                                  const extraCount = activeFormats.length - 3;
                                  return (
                                    <>
                                      {displayFormats.map((fmt) => (
                                        <Badge
                                          key={fmt}
                                          className="bg-[#6c63ff]/10 hover:bg-[#6c63ff]/10 text-[#6c63ff] text-[9px] font-bold px-1.5 py-0.5 border-0 rounded-md whitespace-nowrap"
                                        >
                                          {fmt}
                                        </Badge>
                                      ))}
                                      {extraCount > 0 && (
                                        <span className="text-[10px] font-extrabold text-muted-foreground whitespace-nowrap ml-0.5">
                                          +{extraCount}
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                              <ChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-[150px]">
                          {AVAILABLE_FORMATS.map((fmt) => {
                            const activeFormats = type.allowedFormats
                              .split(",")
                              .map((f) => f.trim().toUpperCase());
                            const isActive = activeFormats.includes(fmt);
                            return (
                              <DropdownMenuCheckboxItem
                                key={fmt}
                                checked={isActive}
                                onCheckedChange={() => handleFormatToggle(type.id, fmt, type.allowedFormats)}
                                className="text-xs font-semibold"
                              >
                                {fmt}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-left font-semibold text-xs justify-between h-9"
                            >
                              <span className="truncate max-w-[130px]">
                                {(() => {
                                  if (!type.targetPositions) return "Semua Posisi";
                                  const activeList = type.targetPositions.split(",").map((p) => p.trim());
                                  if (activeList.length <= 2) return type.targetPositions;
                                  return `${activeList.slice(0, 2).join(", ")} +${activeList.length - 2}`;
                                })()}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-[150px]">
                          <DropdownMenuCheckboxItem
                            checked={!type.targetPositions}
                            onCheckedChange={() => handleFieldChange(type.id, "targetPositions", null)}
                            className="text-xs font-semibold"
                          >
                            Semua Posisi (Universal)
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuSeparator />
                          {positions.map((posName) => {
                            const currentList = type.targetPositions
                              ? type.targetPositions.split(",").map((p) => p.trim())
                              : [];
                            const isChecked = currentList.includes(posName);
                            return (
                              <DropdownMenuCheckboxItem
                                key={posName}
                                checked={isChecked}
                                onCheckedChange={() => {
                                  let newList;
                                  if (isChecked) {
                                    newList = currentList.filter((p) => p !== posName);
                                  } else {
                                    newList = [...currentList, posName];
                                  }
                                  const val = newList.length > 0 ? newList.join(", ") : null;
                                  handleFieldChange(type.id, "targetPositions", val);
                                }}
                                className="text-xs font-semibold"
                              >
                                {posName}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="align-middle text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={type.isMandatory}
                          onCheckedChange={(val) => handleFieldChange(type.id, "isMandatory", val)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={type.requiresExpiryDate}
                          onCheckedChange={(val) => handleFieldChange(type.id, "requiresExpiryDate", val)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-right pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                        onClick={() => handleDelete(type.id, type.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Document Type Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-foreground tracking-tight">Tambah Jenis Dokumen Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newName" className="text-xs font-bold text-muted-foreground">Nama Dokumen</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: KTP, STR Medis, SIP"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newDesc" className="text-xs font-bold text-muted-foreground">Deskripsi (Opsional)</Label>
                <textarea
                  id="newDesc"
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Penjelasan singkat mengenai berkas ini..."
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newMaxSize" className="text-xs font-bold text-muted-foreground">Ukuran Maksimum Berkas (MB)</Label>
                <Input
                  id="newMaxSize"
                  type="number"
                  value={newMaxSize}
                  onChange={(e) => setNewMaxSize(parseInt(e.target.value) || 1)}
                  min={1}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Format Diizinkan (Pilih format yang diperbolehkan)</Label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_FORMATS.map((fmt) => {
                    const activeList = newFormats
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
                          setNewFormats(newList.join(", "));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border select-none transition-all duration-150 ${isActive
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
                <Label className="text-xs font-bold text-muted-foreground">Target Posisi (Kosongkan untuk Semua Posisi/Universal)</Label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-3.5 rounded-xl border border-border">
                  {positions.map((posName) => {
                    const isChecked = newTargetPositions.includes(posName);
                    return (
                      <div key={posName} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`new-pos-${posName}`}
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setNewTargetPositions(newTargetPositions.filter((p) => p !== posName));
                            } else {
                              setNewTargetPositions([...newTargetPositions, posName]);
                            }
                          }}
                          className="rounded border-slate-300 text-[#6c63ff] focus:ring-[#6c63ff] h-4 w-4"
                        />
                        <Label htmlFor={`new-pos-${posName}`} className="text-xs font-semibold text-foreground cursor-pointer">
                          {posName}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 bg-muted p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newIsMandatory" className="text-xs font-bold text-foreground cursor-pointer">Wajib Diisi (Mandatori)</Label>
                  <Switch
                    id="newIsMandatory"
                    checked={newIsMandatory}
                    onCheckedChange={setNewIsMandatory}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newRequiresExpiry" className="text-xs font-bold text-foreground cursor-pointer">Membutuhkan Tanggal Kedaluwarsa</Label>
                  <Switch
                    id="newRequiresExpiry"
                    checked={newRequiresExpiry}
                    onCheckedChange={setNewRequiresExpiry}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
              >
                {createLoading ? (
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
    </div>
  );
}
