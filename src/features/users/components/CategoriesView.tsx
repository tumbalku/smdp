/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Layers,
  Plus,
  AlertCircle,
  CheckCircle2,
  Folder,
  Briefcase,
  ChevronRight,
  Sparkles,
  Award,
  Pencil,
  Trash2,
} from "lucide-react";
import { EmploymentStatusOption, ProfessionGroupOption, EmployeeRankOption, WorkplaceOption } from "../types";

type DataType = "STATUS" | "GROUP" | "PROFESSION" | "POSITION" | "RANK" | "WORKPLACE";

export function CategoriesView() {
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatusOption[]>([]);
  const [professionGroups, setProfessionGroups] = useState<ProfessionGroupOption[]>([]);
  const [employeeRanks, setEmployeeRanks] = useState<EmployeeRankOption[]>([]);
  const [workplaces, setWorkplaces] = useState<WorkplaceOption[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [type, setType] = useState<DataType>("STATUS");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; type: DataType; parentId?: string } | null>(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/employment-categories");
      const resData = await res.json();
      if (res.ok && resData.success && resData.data) {
        setEmploymentStatuses(resData.data.employmentStatuses || []);
        setProfessionGroups(resData.data.professionGroups || []);
        setEmployeeRanks(resData.data.employeeRanks || []);
        setWorkplaces(resData.data.workplaces || []);
      } else {
        throw new Error(resData.error?.message || "Gagal memuat kategori kepegawaian.");
      }
    } catch (err) {
      console.error("Gagal memuat kategori kepegawaian:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat kategori.");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset parentId when type changes, but not when in editing mode
  useEffect(() => {
    if (!editingItem) {
      setParentId("");
    }
    setError("");
    setSuccess("");
  }, [type, editingItem]);

  const handleStartEdit = (id: string, itemName: string, itemType: DataType, pId?: string) => {
    setEditingItem({ id, name: itemName, type: itemType, parentId: pId });
    setName(itemName);
    setType(itemType);
    setParentId(pId || "");
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setName("");
    setType("STATUS");
    setParentId("");
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string, itemType: DataType, itemName: string) => {
    const confirmText = itemType === "STATUS" || itemType === "PROFESSION"
      ? `Peringatan: Menghapus "${itemName}" akan menghapus semua sub-kategori di bawahnya. Apakah Anda yakin ingin menghapus?`
      : `Apakah Anda yakin ingin menghapus "${itemName}"?`;

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/employment-categories?id=${id}&type=${itemType}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Gagal menghapus kategori.");
      }

      setSuccess(`Data "${itemName}" berhasil dihapus.`);
      if (editingItem?.id === id) {
        handleCancelEdit();
      }
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if ((type === "GROUP" || type === "POSITION") && !parentId) {
      setError("Silakan pilih kategori induk terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = "/api/admin/employment-categories";
      const method = editingItem ? "PATCH" : "POST";
      const bodyPayload = editingItem
        ? { id: editingItem.id, type, name: name.trim(), parentId: parentId || null }
        : { type, name: name.trim(), parentId: parentId || null };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || `Gagal ${editingItem ? "memperbarui" : "menambahkan"} kategori.`);
      }

      setSuccess(`Data "${name.trim()}" berhasil ${editingItem ? "diperbarui" : "ditambahkan"}.`);
      setName("");
      setEditingItem(null);
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#6c63ff] animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Memuat Kategori & Struktur Kepegawaian...
          </p>
      </div>
    );
  }

  const getTypeColor = (t: DataType) => {
    switch (t) {
      case "STATUS": return "border-t-4 border-t-amber-500";
      case "GROUP": return "border-t-4 border-t-amber-400";
      case "PROFESSION": return "border-t-4 border-t-blue-500";
      case "POSITION": return "border-t-4 border-t-blue-400";
      case "RANK": return "border-t-4 border-t-orange-500";
      case "WORKPLACE": return "border-t-4 border-t-emerald-500";
      default: return "border-t-4 border-t-primary";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn" id="categories-management-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Layers className="w-9 h-9 text-[#6c63ff] animate-pulse" />
            Kelola Kategori Kepegawaian
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Konfigurasi master data untuk menstrukturkan status kepegawaian, kelompok profesi, jabatan, serta pangkat & golongan.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 border border-border px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground shrink-0 self-start md:self-auto shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Status Sistem: Terhubung</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Card (1/3 Width) */}
        <div className="lg:col-span-1">
          <Card className={`border border-border bg-card shadow-sm sticky top-20 transition-all duration-300 ${getTypeColor(type)}`}>
            <CardHeader className="border-b border-border/80 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-[#6c63ff]" />
                {editingItem ? "Edit Data Master" : "Tambah Data Master"}
              </CardTitle>
              <CardDescription className="text-xs">
                {editingItem ? `Sedang mengubah entri: ${editingItem.name}` : "Tambahkan entri data master kepegawaian baru."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="pageMasterType" className="text-xs font-bold text-muted-foreground">Tipe Data *</Label>
                  <Select disabled={!!editingItem} value={type} onValueChange={(val) => setType((val || "STATUS") as DataType)}>
                    <SelectTrigger id="pageMasterType" className="w-full">
                      <SelectValue placeholder="Pilih Tipe Data" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STATUS">Status Kepegawaian (Induk)</SelectItem>
                      <SelectItem value="GROUP">Jenis Kepegawaian (Sub-Status)</SelectItem>
                      <SelectItem value="PROFESSION">Kelompok Profesi (Induk)</SelectItem>
                      <SelectItem value="POSITION">Jabatan (Sub-Profesi)</SelectItem>
                      <SelectItem value="RANK">Pangkat / Golongan (Induk)</SelectItem>
                      <SelectItem value="WORKPLACE">Tempat Tugas (Induk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Parent Relation (Conditionally Rendered) */}
                {(type === "GROUP" || type === "POSITION") && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <Label htmlFor="pageParentSelect" className="text-xs font-bold text-muted-foreground">
                      {type === "GROUP" ? "Status Kepegawaian Induk *" : "Kelompok Profesi Induk *"}
                    </Label>
                    <Select value={parentId} onValueChange={(val) => setParentId(val || "")}>
                      <SelectTrigger id="pageParentSelect" className="w-full">
                        <SelectValue placeholder={type === "GROUP" ? "Pilih Status Induk" : "Pilih Kelompok Induk"} />
                      </SelectTrigger>
                      <SelectContent>
                        {type === "GROUP"
                          ? employmentStatuses.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))
                          : professionGroups.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Name Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="pageDataName" className="text-xs font-bold text-muted-foreground">Nama Entri Baru *</Label>
                  <Input
                    id="pageDataName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      type === "STATUS" ? "Contoh: ASN, Non ASN" :
                      type === "GROUP" ? "Contoh: PNS, PPPK, BLUD Kontrak" :
                      type === "PROFESSION" ? "Contoh: Medis, Keperawatan, Administrasi" :
                      type === "RANK" ? "Contoh: Penata (III/c), Pembina (IV/a)" :
                      type === "WORKPLACE" ? "Contoh: Ruang ICCU, Ruang ICU, Ruang Isolasi" :
                      "Contoh: Dokter Umum, Perawat Ahli Pertama, Bidan"
                    }
                    className="w-full"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-border/80">
                  {editingItem && (
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      type="button"
                      className="flex-1 font-bold text-xs"
                      disabled={loading}
                    >
                      Batal
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={loading || !name.trim() || ((type === "GROUP" || type === "POSITION") && !parentId)}
                    className="flex-grow bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingItem ? (
                      "Simpan Perubahan"
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Tambah Data
                      </>
                    )}
                  </Button>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="py-2.5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-950/60 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <AlertDescription className="text-xs font-semibold">{success}</AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: 2x2 Grid Layout (2/3 Width) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Status & Jenis Kepegawaian */}
            <Card className="border border-border bg-card shadow-xs flex flex-col h-[520px] transition-all duration-200 hover:shadow-md hover:border-border/80 border-t-4 border-t-amber-500">
              <CardHeader className="border-b border-border/80 shrink-0 pb-3 bg-muted/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600">
                    <Folder className="w-4.5 h-4.5" />
                    <span>Status & Jenis</span>
                  </CardTitle>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {employmentStatuses.length} Status / {employmentStatuses.reduce((acc, curr) => acc + (curr.groups?.length || 0), 0)} Jenis
                  </span>
                </div>
                <CardDescription className="text-[11px] mt-1.5 leading-relaxed">
                  Hierarki status kepegawaian induk beserta jenis pegawai di bawahnya.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto pt-4 pb-4 space-y-3 scrollbar-thin">
                {employmentStatuses.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">Belum ada data status.</p>
                ) : (
                  <div className="space-y-3">
                    {employmentStatuses.map((status) => (
                      <div key={status.id} className="bg-muted/20 border border-border/50 rounded-lg p-2.5 space-y-1.5">
                        <div className="font-extrabold text-xs text-foreground flex items-center justify-between group/status">
                          <div className="flex items-center gap-1.5 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{status.name}</span>
                          </div>
                          <div className="opacity-0 group-hover/status:opacity-100 flex items-center gap-0.5 transition-all duration-150 shrink-0">
                            <button
                              onClick={() => handleStartEdit(status.id, status.name, "STATUS")}
                              className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                              title="Edit Status"
                              type="button"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(status.id, "STATUS", status.name)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                              title="Hapus Status"
                              type="button"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {status.groups && status.groups.length > 0 ? (
                          <div className="pl-4.5 space-y-1 border-l-2 border-amber-500/20 ml-1.5 pt-0.5 pb-0.5">
                            {status.groups.map((group) => (
                              <div key={group.id} className="text-[11px] text-muted-foreground flex items-center justify-between group/group py-1 px-1.5 hover:bg-muted/70 hover:text-foreground rounded transition-all duration-150">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                                  <span className="truncate">{group.name}</span>
                                </div>
                                <div className="opacity-0 group-hover/group:opacity-100 flex items-center gap-0.5 transition-all duration-150 shrink-0">
                                  <button
                                    onClick={() => handleStartEdit(group.id, group.name, "GROUP", status.id)}
                                    className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                                    title="Edit Jenis"
                                    type="button"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(group.id, "GROUP", group.name)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                                    title="Hapus Jenis"
                                    type="button"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="pl-6 text-[10px] text-muted-foreground/60 italic">Belum ada jenis kepegawaian.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column 2: Kelompok Profesi & Jabatan */}
            <Card className="border border-border bg-card shadow-xs flex flex-col h-[520px] transition-all duration-200 hover:shadow-md hover:border-border/80 border-t-4 border-t-blue-500">
              <CardHeader className="border-b border-border/80 shrink-0 pb-3 bg-muted/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
                    <Briefcase className="w-4.5 h-4.5" />
                    <span>Profesi & Jabatan</span>
                  </CardTitle>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {professionGroups.length} Profesi / {professionGroups.reduce((acc, curr) => acc + (curr.positions?.length || 0), 0)} Jabatan
                  </span>
                </div>
                <CardDescription className="text-[11px] mt-1.5 leading-relaxed">
                  Kelompok profesi pegawai beserta daftar jabatan spesifik yang tersedia.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto pt-4 pb-4 space-y-3 scrollbar-thin">
                {professionGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">Belum ada data profesi.</p>
                ) : (
                  <div className="space-y-3">
                    {professionGroups.map((prof) => (
                      <div key={prof.id} className="bg-muted/20 border border-border/50 rounded-lg p-2.5 space-y-1.5">
                        <div className="font-extrabold text-xs text-foreground flex items-center justify-between group/prof">
                          <div className="flex items-center gap-1.5 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{prof.name}</span>
                          </div>
                          <div className="opacity-0 group-hover/prof:opacity-100 flex items-center gap-0.5 transition-all duration-150 shrink-0">
                            <button
                              onClick={() => handleStartEdit(prof.id, prof.name, "PROFESSION")}
                              className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                              title="Edit Kelompok"
                              type="button"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(prof.id, "PROFESSION", prof.name)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                              title="Hapus Kelompok"
                              type="button"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {prof.positions && prof.positions.length > 0 ? (
                          <div className="pl-4.5 space-y-1 border-l-2 border-blue-500/20 ml-1.5 pt-0.5 pb-0.5">
                            {prof.positions.map((pos) => (
                              <div key={pos.id} className="text-[11px] text-muted-foreground flex items-center justify-between group/pos py-1 px-1.5 hover:bg-muted/70 hover:text-foreground rounded transition-all duration-150">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                  <span className="truncate">{pos.name}</span>
                                </div>
                                <div className="opacity-0 group-hover/pos:opacity-100 flex items-center gap-0.5 transition-all duration-150 shrink-0">
                                  <button
                                    onClick={() => handleStartEdit(pos.id, pos.name, "POSITION", prof.id)}
                                    className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                                    title="Edit Jabatan"
                                    type="button"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(pos.id, "POSITION", pos.name)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                                    title="Hapus Jabatan"
                                    type="button"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="pl-6 text-[10px] text-muted-foreground/60 italic">Belum ada jabatan.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Third Column: Pangkat & Golongan */}
            <Card className="border border-border bg-card shadow-xs flex flex-col h-[520px] transition-all duration-200 hover:shadow-md hover:border-border/80 border-t-4 border-t-orange-500">
              <CardHeader className="border-b border-border/80 shrink-0 pb-3 bg-muted/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-600">
                    <Award className="w-4.5 h-4.5" />
                    <span>Pangkat & Golongan</span>
                  </CardTitle>
                  <span className="text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full border border-orange-500/20">
                    {employeeRanks.length} Tingkatan
                  </span>
                </div>
                <CardDescription className="text-[11px] mt-1.5 leading-relaxed">
                  Daftar pangkat golongan ruang untuk jenjang karir kepegawaian.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto pt-4 pb-4 space-y-1.5 scrollbar-thin">
                {employeeRanks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">Belum ada data pangkat.</p>
                ) : (
                  employeeRanks.map((rank) => (
                    <div key={rank.id} className="text-xs text-muted-foreground flex items-center justify-between group/rank py-1.5 px-3 bg-muted/20 hover:bg-muted/60 hover:text-foreground rounded-lg border border-border/40 transition-all duration-150">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                        <span className="truncate font-medium">{rank.name}</span>
                      </div>
                      <div className="opacity-0 group-hover/rank:opacity-100 flex items-center gap-0.5 transition-all duration-150 shrink-0">
                        <button
                          onClick={() => handleStartEdit(rank.id, rank.name, "RANK")}
                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                          title="Edit Pangkat"
                          type="button"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(rank.id, "RANK", rank.name)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          title="Hapus Pangkat"
                          type="button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Column 4: Tempat Tugas */}
            <Card className="border border-border bg-card shadow-xs flex flex-col h-[520px] transition-all duration-200 hover:shadow-md hover:border-border/80 border-t-4 border-t-emerald-500">
              <CardHeader className="border-b border-border/80 shrink-0 pb-3 bg-muted/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                    <Layers className="w-4.5 h-4.5" />
                    <span>Tempat Tugas</span>
                  </CardTitle>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {workplaces.length} Unit
                  </span>
                </div>
                <CardDescription className="text-[11px] mt-1.5 leading-relaxed">
                  Daftar tempat tugas, ruang pelayanan, poli, atau unit kerja pegawai.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto pt-4 pb-4 space-y-1.5 scrollbar-thin">
                {workplaces.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">Belum ada data tempat tugas.</p>
                ) : (
                  workplaces.map((w) => (
                    <div key={w.id} className="text-xs text-muted-foreground flex items-center justify-between group/workplace py-1.5 px-3 bg-muted/20 hover:bg-muted/60 hover:text-foreground rounded-lg border border-border/40 transition-all duration-150">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                        <span className="truncate font-medium">{w.name}</span>
                      </div>
                      <div className="opacity-0 group-hover/workplace:opacity-100 flex items-center gap-0.5 transition-all duration-150 shrink-0">
                        <button
                          onClick={() => handleStartEdit(w.id, w.name, "WORKPLACE")}
                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                          title="Edit Tempat Tugas"
                          type="button"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, "WORKPLACE", w.name)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          title="Hapus Tempat Tugas"
                          type="button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
