/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react";
import { DocumentType } from "../types";

export function useDocumentTypes() {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [editedTypes, setEditedTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/document-types");
      const resData = await res.json();
      if (res.ok) {
        setTypes(resData.data || []);
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
  }, []);

  const fetchPositions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchTypes();
    fetchPositions();
  }, [fetchTypes, fetchPositions]);

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

  const handleCreate = async (formData: {
    name: string;
    description: string;
    maxSize: number;
    formats: string;
    targetPositions: string[];
    isMandatory: boolean;
    requiresExpiry: boolean;
    icon: string;
  }) => {
    setCreateLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/document-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          targetPositions: formData.targetPositions.length > 0 ? formData.targetPositions.join(", ") : null,
          isMandatory: formData.isMandatory,
          requiresExpiryDate: formData.requiresExpiry,
          maxSize: formData.maxSize,
          allowedFormats: formData.formats,
          icon: formData.icon,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal membuat jenis dokumen.");
      }

      setSuccessMsg(`Jenis dokumen "${formData.name}" berhasil ditambahkan.`);
      setCreateOpen(false);
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

  // ponytail: memoize complex object comparison to prevent recalculation on every render
  const isChanged = useMemo(
    () => JSON.stringify(types) !== JSON.stringify(editedTypes),
    [types, editedTypes]
  );

  return {
    types,
    editedTypes,
    loading,
    saving,
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,
    isChanged,
    positions,

    // Create Modal triggers
    createOpen,
    setCreateOpen,
    createLoading,
    
    // Actions
    handleFieldChange,
    handleFormatToggle,
    handleSaveChanges,
    handleCreate,
    handleDelete,
    fetchTypes,
  };
}
