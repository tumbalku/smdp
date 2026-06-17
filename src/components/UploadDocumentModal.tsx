"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Upload, File, AlertCircle, Loader2 } from "lucide-react";

interface DocumentType {
  id: string;
  name: string;
  requiresExpiryDate: boolean;
  isMandatory: boolean;
  maxSize?: number;
  allowedFormats?: string;
}

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  preSelectedType?: DocumentType | null;
}

export default function UploadDocumentModal({
  open,
  onClose,
  onUploadSuccess,
  preSelectedType = null,
}: UploadDocumentModalProps) {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (open) {
      // Fetch document types
      fetch("/api/document-types")
        .then((res) => res.json())
        .then((resData) => {
          if (resData.data) {
            setDocTypes(resData.data);
          }
        })
        .catch((err) => console.error("Error fetching types:", err));

      // Reset state
      setSelectedTypeId(preSelectedType ? preSelectedType.id : "");
      setIssueDate("");
      setExpiryDate("");
      setFile(null);
      setErrorMsg("");
      setFieldErrors({});
    }
  }, [open, preSelectedType]);

  const selectedType = docTypes.find((t) => t.id === selectedTypeId) || preSelectedType;
  const requiresExpiry = selectedType?.requiresExpiryDate || false;

  const validateFile = (selectedFile: File, type: DocumentType | null): { valid: boolean; error?: string } => {
    const maxSizeMB = type?.maxSize ?? 5;
    const allowedFormatsStr = type?.allowedFormats ?? "PDF, JPG, PNG";
    const sizeLimit = maxSizeMB * 1024 * 1024;

    if (selectedFile.size > sizeLimit) {
      return { valid: false, error: `Ukuran file melebihi batas maksimum ${maxSizeMB}MB.` };
    }

    const allowedExts = allowedFormatsStr
      .split(",")
      .map((f: string) => f.trim().toLowerCase());
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    const mimeMap: Record<string, string[]> = {
      pdf: ["application/pdf"],
      jpg: ["image/jpeg", "image/jpg", "image/pjpeg"],
      jpeg: ["image/jpeg", "image/jpg", "image/pjpeg"],
      png: ["image/png"],
      docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      doc: ["application/msword"],
      xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      xls: ["application/vnd.ms-excel"],
      zip: ["application/zip", "application/x-zip-compressed"],
    };

    const isAllowed = allowedExts.some((ext: string) => {
      if (ext === fileExt) return true;
      if ((ext === "jpg" || ext === "jpeg") && (fileExt === "jpg" || fileExt === "jpeg")) return true;
      const mimes = mimeMap[ext];
      if (mimes && mimes.includes(selectedFile.type)) return true;
      return false;
    });

    if (!isAllowed) {
      return { valid: false, error: `Format file tidak didukung. Gunakan ${allowedFormatsStr}.` };
    }

    return { valid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = validateFile(selectedFile, selectedType);
      if (!validation.valid) {
        setErrorMsg(validation.error || "File tidak valid.");
        setFile(null);
        return;
      }

      setErrorMsg("");
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const errors: { [key: string]: string } = {};
    if (!selectedTypeId) {
      errors.selectedTypeId = "Jenis dokumen wajib dipilih.";
    }
    if (!file) {
      errors.file = "Berkas dokumen wajib diunggah.";
    }
    if (requiresExpiry && !issueDate) {
      errors.issueDate = "Tanggal terbit wajib diisi untuk jenis dokumen ini.";
    }
    if (requiresExpiry && !expiryDate) {
      errors.expiryDate = "Tanggal masa berlaku wajib diisi untuk jenis dokumen ini.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("documentTypeId", selectedTypeId);
      if (issueDate) formData.append("issueDate", issueDate);
      if (expiryDate) formData.append("expiryDate", expiryDate);


      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Terjadi kesalahan saat mengunggah.");
      }

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah dokumen.");
    } finally {
      setLoading(false);
    }
  };

  const getAcceptAttribute = () => {
    if (!selectedType?.allowedFormats) return ".pdf,.jpg,.jpeg,.png";
    return selectedType.allowedFormats
      .split(",")
      .map((f) => {
        const ext = f.trim().toLowerCase();
        if (ext === "jpg") return ".jpg,.jpeg";
        return `.${ext}`;
      })
      .join(",");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px]" id="upload-document-modal">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-slate-800 tracking-tight">
            {preSelectedType ? `Unggah Ulang Dokumen ${preSelectedType.name}` : "Unggah Dokumen Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {!preSelectedType && (
              <div className="space-y-1.5">
                <Label htmlFor="docType" className="text-xs font-bold text-slate-700">
                  Jenis Dokumen
                </Label>
                <Select
                  value={selectedTypeId}
                  onValueChange={(val) => {
                    setSelectedTypeId(val || "");
                    setExpiryDate("");
                    setIssueDate("");

                    const newType = val ? docTypes.find((t) => t.id === val) : null;
                    if (file && newType) {
                      const validation = validateFile(file, newType);
                      if (!validation.valid) {
                        setErrorMsg(`Berkas "${file.name}" tidak cocok dengan jenis dokumen baru. ${validation.error}`);
                        setFile(null);
                      }
                    }
                  }}

                >
                  <SelectTrigger id="docType" className="w-full">
                    <SelectValue placeholder="Pilih Jenis Dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {docTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} {type.isMandatory ? "(Wajib)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.selectedTypeId && (
                  <p className="text-[10px] text-destructive">{fieldErrors.selectedTypeId}</p>
                )}
              </div>
            )}

            {requiresExpiry && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="issueDate" className="text-xs font-bold text-slate-700">
                    Tanggal Terbit <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    required={requiresExpiry}
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={fieldErrors.issueDate ? "border-destructive" : ""}
                  />
                  {fieldErrors.issueDate && (
                    <p className="text-[10px] text-destructive">{fieldErrors.issueDate}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expiryDate" className="text-xs font-bold text-slate-700">
                    Tanggal Kedaluwarsa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    required={requiresExpiry}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={fieldErrors.expiryDate ? "border-destructive" : ""}
                  />
                  {fieldErrors.expiryDate && (
                    <p className="text-[10px] text-destructive">{fieldErrors.expiryDate}</p>
                  )}
                </div>
              </div>
            )}


            <div className="space-y-2">
              <div
                onClick={handleButtonClick}
                className={`py-6 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-200 bg-slate-50 hover:bg-slate-100 ${
                  fieldErrors.file ? "border-destructive" : "border-slate-300"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--jobster-accent-light, #e8e7ff)", color: "var(--jobster-accent, #6c63ff)" }}
                >
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700">
                    {file ? file.name : "Pilih atau Seret Berkas di sini"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format: {selectedType?.allowedFormats ?? "PDF, JPG, PNG"} (Maks {selectedType?.maxSize ?? 5}MB)
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={getAcceptAttribute()}
                onChange={handleFileChange}
              />
              {fieldErrors.file && (
                <p className="text-[10px] text-destructive mt-1">{fieldErrors.file}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  Mengunggah...
                </>
              ) : (
                "Unggah"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
