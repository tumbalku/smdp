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

interface ManageCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employmentStatuses: EmploymentStatusOption[];
  professionGroups: ProfessionGroupOption[];
  employeeRanks: EmployeeRankOption[];
  workplaces: WorkplaceOption[];
  onSuccess: () => void;
}

type DataType = "STATUS" | "GROUP" | "PROFESSION" | "POSITION" | "RANK" | "WORKPLACE";

export function ManageCategoriesModal({
  open,
  onOpenChange,
  employmentStatuses,
  professionGroups,
  employeeRanks,
  workplaces,
  onSuccess,
}: ManageCategoriesModalProps) {
  const [type, setType] = useState<DataType>("STATUS");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; type: DataType; parentId?: string } | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setType("STATUS");
      setName("");
      setParentId("");
      setError("");
      setSuccess("");
      setEditingItem(null);
    }
  }, [open]);

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
      onSuccess(); // Refetch categories in parent context
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

    // Local validation
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
      onSuccess(); // Refetch categories in parent context
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[1000px] max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-extrabold text-foreground tracking-tight flex items-center gap-2 text-xl">
            <Layers className="w-6 h-6 text-[#6c63ff]" />
            Kelola Kategori & Jabatan Kepegawaian
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-6 text-sm scrollbar-thin">
          {/* Form to Add New */}
          <form onSubmit={handleSubmit} className="bg-muted/30 border border-border p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-1.5 font-bold text-foreground justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#6c63ff]" />
                <span>{editingItem ? `Edit Master Data: ${editingItem.name}` : "Tambah Master Data Baru"}</span>
              </div>
              {editingItem && (
                <Button
                  onClick={handleCancelEdit}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                  type="button"
                >
                  Batal Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="masterType" className="text-xs font-bold text-muted-foreground">Tipe Data *</Label>
                <Select disabled={!!editingItem} value={type} onValueChange={(val) => setType((val || "STATUS") as DataType)}>
                  <SelectTrigger id="masterType" className="w-full">
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
                  <Label htmlFor="parentSelect" className="text-xs font-bold text-muted-foreground">
                    {type === "GROUP" ? "Status Kepegawaian Induk *" : "Kelompok Profesi Induk *"}
                  </Label>
                  <Select value={parentId} onValueChange={(val) => setParentId(val || "")}>
                    <SelectTrigger id="parentSelect" className="w-full">
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
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="dataName" className="text-xs font-bold text-muted-foreground">Nama Kategori / Jabatan Baru *</Label>
                <div className="flex gap-2">
                  <Input
                    id="dataName"
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
                    className="flex-1"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={loading || !name.trim() || ((type === "GROUP" || type === "POSITION") && !parentId)}
                    className="bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white font-bold shrink-0 flex items-center gap-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingItem ? (
                      "Simpan"
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Tambah
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-700 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-xs font-semibold">{success}</AlertDescription>
              </Alert>
            )}
          </form>

          {/* List Section Hierarchy */}
          <div className="space-y-2.5">
            <Label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide">
              Struktur Kategori Saat Ini
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Left Column: Kepegawaian tree */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border pb-2 shrink-0">
                  <Folder className="w-4.5 h-4.5 text-amber-500" />
                  <span>Status & Jenis Kepegawaian</span>
                </div>
                {employmentStatuses.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">Belum ada data status.</p>
                ) : (
                  <div className="space-y-3">
                    {employmentStatuses.map((status) => (
                      <div key={status.id} className="space-y-1">
                        <div className="font-extrabold text-foreground flex items-center justify-between group/status py-0.5 px-1 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-1 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{status.name}</span>
                          </div>
                          <div className="opacity-0 group-hover/status:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                            <button
                              onClick={() => handleStartEdit(status.id, status.name, "STATUS")}
                              className="p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                              title="Edit"
                              type="button"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(status.id, "STATUS", status.name)}
                              className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                              title="Hapus"
                              type="button"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {status.groups && status.groups.length > 0 ? (
                          <div className="pl-6 space-y-1 border-l border-border/80 ml-1.5 pt-0.5 pb-0.5">
                            {status.groups.map((group) => (
                              <div key={group.id} className="text-xs text-muted-foreground flex items-center justify-between group/group py-0.5 px-1 hover:bg-muted/50 rounded">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full shrink-0" />
                                  <span className="truncate">{group.name}</span>
                                </div>
                                <div className="opacity-0 group-hover/group:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                                  <button
                                    onClick={() => handleStartEdit(group.id, group.name, "GROUP", status.id)}
                                    className="p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                                    title="Edit"
                                    type="button"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(group.id, "GROUP", group.name)}
                                    className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                                    title="Hapus"
                                    type="button"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="pl-6 text-[11px] text-muted-foreground italic">Belum ada jenis kepegawaian.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Profesi & Jabatan tree */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border pb-2 shrink-0">
                  <Briefcase className="w-4.5 h-4.5 text-blue-500" />
                  <span>Kelompok Profesi & Jabatan</span>
                </div>
                {professionGroups.length === 0 ? (
                   <p className="text-xs text-muted-foreground italic py-2">Belum ada data profesi.</p>
                ) : (
                  <div className="space-y-3">
                    {professionGroups.map((prof) => (
                      <div key={prof.id} className="space-y-1">
                        <div className="font-extrabold text-foreground flex items-center justify-between group/prof py-0.5 px-1 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-1 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{prof.name}</span>
                          </div>
                          <div className="opacity-0 group-hover/prof:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                            <button
                              onClick={() => handleStartEdit(prof.id, prof.name, "PROFESSION")}
                              className="p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                              title="Edit"
                              type="button"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(prof.id, "PROFESSION", prof.name)}
                              className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                              title="Hapus"
                              type="button"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {prof.positions && prof.positions.length > 0 ? (
                          <div className="pl-6 space-y-1 border-l border-border/80 ml-1.5 pt-0.5 pb-0.5">
                            {prof.positions.map((pos) => (
                              <div key={pos.id} className="text-xs text-muted-foreground flex items-center justify-between group/pos py-0.5 px-1 hover:bg-muted/50 rounded">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full shrink-0" />
                                  <span className="truncate">{pos.name}</span>
                                </div>
                                <div className="opacity-0 group-hover/pos:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                                  <button
                                    onClick={() => handleStartEdit(pos.id, pos.name, "POSITION", prof.id)}
                                    className="p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                                    title="Edit"
                                    type="button"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(pos.id, "POSITION", pos.name)}
                                    className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                                    title="Hapus"
                                    type="button"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="pl-6 text-[11px] text-muted-foreground italic">Belum ada jabatan.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Third Column: Pangkat & Golongan */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border pb-2 shrink-0">
                  <Award className="w-4.5 h-4.5 text-amber-600" />
                  <span>Pangkat & Golongan</span>
                </div>
                {employeeRanks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">Belum ada data pangkat.</p>
                ) : (
                  <div className="space-y-1.5">
                    {employeeRanks.map((rank) => (
                      <div key={rank.id} className="text-xs text-muted-foreground flex items-center justify-between group/rank py-0.5 px-1 hover:bg-muted/50 rounded">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full shrink-0" />
                          <span className="truncate">{rank.name}</span>
                        </div>
                        <div className="opacity-0 group-hover/rank:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                          <button
                            onClick={() => handleStartEdit(rank.id, rank.name, "RANK")}
                            className="p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                            title="Edit"
                            type="button"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(rank.id, "RANK", rank.name)}
                            className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                            title="Hapus"
                            type="button"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fourth Column: Tempat Tugas */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border pb-2 shrink-0">
                  <Layers className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Tempat Tugas</span>
                </div>
                {workplaces.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">Belum ada data tempat tugas.</p>
                ) : (
                  <div className="space-y-1.5">
                    {workplaces.map((w) => (
                      <div key={w.id} className="text-xs text-muted-foreground flex items-center justify-between group/workplace py-0.5 px-1 hover:bg-muted/50 rounded animate-fadeIn">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full shrink-0" />
                          <span className="truncate">{w.name}</span>
                        </div>
                        <div className="opacity-0 group-hover/workplace:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                          <button
                            onClick={() => handleStartEdit(w.id, w.name, "WORKPLACE")}
                            className="p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                            title="Edit"
                            type="button"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(w.id, "WORKPLACE", w.name)}
                            className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                            title="Hapus"
                            type="button"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t border-border">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-6"
            disabled={loading}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
