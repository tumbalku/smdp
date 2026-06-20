/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download } from "lucide-react";

interface DocumentPreviewProps {
  fileName: string;
  filePath: string;
}

export function DocumentPreview({ fileName, filePath }: DocumentPreviewProps) {
  const downloadUrl = `/api/documents/download?path=${encodeURIComponent(filePath)}`;

  return (
    <Card className="border border-border shadow-xs overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-extrabold text-sm text-foreground">Pratinjau Berkas</CardTitle>
          <CardDescription className="text-[10px] truncate max-w-[400px]" title={fileName}>
            {fileName}
          </CardDescription>
        </div>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-8 px-3 text-xs font-semibold text-foreground transition-colors gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Unduh Berkas
        </a>
      </CardHeader>
      <CardContent className="p-2 bg-muted">
        <div className="w-full border border-border rounded-lg overflow-hidden bg-card">
          {fileName.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={`${downloadUrl}#toolbar=0`}
              className="w-full h-[650px] rounded-lg border-0 bg-white"
            />
          ) : fileName.toLowerCase().match(/\.(png|jpg|jpeg)$/) ? (
            <img
              src={downloadUrl}
              alt="Pratinjau"
              className="w-full max-h-[650px] object-contain rounded-lg bg-white mx-auto block"
            />
          ) : (
            <div className="py-24 text-center">
              <p className="text-xs text-muted-foreground font-semibold">
                Pratinjau tidak didukung untuk tipe berkas ini. Silakan unduh dokumen untuk meninjau secara lokal.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default DocumentPreview;
