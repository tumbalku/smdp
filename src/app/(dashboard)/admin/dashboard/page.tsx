"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatsCard } from "@/components/StatsCard";
import dynamic from "next/dynamic";

const CalendarSection = dynamic(
  () => import("@/components/CalendarSection").then((mod) => mod.CalendarSection),
  {
    ssr: false,
    loading: () => (
      <Card className="border border-border shadow-xs">
        <CardContent className="p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </CardContent>
      </Card>
    ),
  }
);
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle,
  HeartPulse,
} from "lucide-react";
import VerifyDocumentModal from "@/components/VerifyDocumentModal";

interface RetirementUser {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  gender: string | null;
  birthDate: string | null;
  age: number;
  status: "MENDEKATI_PENSIUN" | "PENSIUN";
}

interface AdminStats {
  totalEmployees: number;
  genderStats: {
    maleCount: number;
    femaleCount: number;
    unknownGenderCount: number;
  };
  retirementStats: {
    activeCount: number;
    approachingCount: number;
    retiredCount: number;
    noBirthDateCount: number;
    retirementAgeLimit: number;
  };
  retirementList: RetirementUser[];
}

interface DocumentRecord {
  id: string;
  fileName: string;
  filePath: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  expiryStatus: "AMAN" | "KEDALUWARSA" | "MENDEKATI_KEDALUWARSA";
  daysRemaining: number | null;
  documentType: {
    name: string;
    targetPositions: string | null;
  };
  owner: {
    name: string;
    employeeId: string | null;
    email: string;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Verify modal state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();

      const docsRes = await fetch("/api/documents");
      const docsData = await docsRes.json();

      if (statsRes.ok && docsRes.ok) {
        setStats(statsData.data);
        setDocuments(docsData.data || []);
      } else {
        throw new Error(
          statsData.error?.message ||
          docsData.error?.message ||
          "Gagal mengambil data administrasi."
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewClick = (docId: string) => {
    setSelectedDocId(docId);
    setVerifyOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data statistik admin...</p>
      </div>
    );
  }

  // Document calculations
  const pendingDocs = documents.filter((d) => d.status === "PENDING");
  const expiredDocs = documents.filter((d) => d.expiryStatus === "KEDALUWARSA");
  const warnDocs = documents.filter((d) => d.expiryStatus === "MENDEKATI_KEDALUWARSA");
  const criticalDocumentsCount = expiredDocs.length + warnDocs.length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" id="admin-dashboard-container">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Administrasi Kepegawaian</h1>
        <p className="text-xs font-bold text-muted-foreground mt-1">
          Selamat datang kembali, <span className="text-primary">{session?.user?.name || "Administrator"}</span>. Pantau kelayakan berkas pegawai dan kepatuhan regulasi di bawah ini.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Pegawai"
          value={stats?.totalEmployees || 0}
          subtext="Seluruh pegawai terdaftar aktif"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Total Dokumen"
          value={documents.length}
          subtext="Semua berkas yang tersimpan"
          icon={FileText}
          variant="success"
        />
        <StatsCard
          title="Tinjauan Tertunda"
          value={pendingDocs.length}
          subtext="Menunggu persetujuan HRD"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Berkas Bermasalah"
          value={criticalDocumentsCount}
          subtext={`${expiredDocs.length} Kedaluwarsa, ${warnDocs.length} Mendekati`}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue (Colspan 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Antrian Persetujuan Berkas</h2>
            <Badge className="bg-[#6c63ff] text-white hover:bg-[#6c63ff] font-bold px-2 py-0.5 text-xs">
              {pendingDocs.length} Tertunda
            </Badge>
          </div>

          <Card className="border border-border shadow-xs">
            <CardContent className="p-0">
              {pendingDocs.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-xs text-muted-foreground font-extrabold">Semua berkas bersih!</p>
                  <p className="text-[10px] text-muted-foreground">Tidak ada dokumen baru yang memerlukan persetujuan.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs">Pegawai</TableHead>
                      <TableHead className="font-bold text-xs">Jenis Dokumen</TableHead>
                      <TableHead className="font-bold text-xs">Diunggah Pada</TableHead>
                      <TableHead className="font-bold text-xs text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDocs.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-muted/50">
                        <TableCell className="py-3">
                          <div>
                            <p className="font-extrabold text-xs text-foreground">{doc.owner.name}</p>
                            <p className="text-[10px] text-muted-foreground">NIP: {doc.owner.employeeId || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground">{doc.documentType.name}</span>
                            {doc.documentType.targetPositions && (
                              <Badge className="bg-[#6c63ff]/10 hover:bg-[#6c63ff]/10 text-[#6c63ff] text-[9px] font-bold px-1 py-0 border-0">
                                {doc.documentType.targetPositions}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {formatDate(doc.uploadedAt)}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Link
                            href={`/admin/verification/${doc.id}`}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-[10px] font-bold text-white transition-all hover:opacity-95"
                            style={{ backgroundColor: "var(--jobster-accent, #6c63ff)" }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Tinjau
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Retirement Monitoring */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Masa Pensiun Pegawai</h2>
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="font-bold text-sm text-foreground">Distribusi Batas Usia (58 Tahun)</CardTitle>
              <CardDescription className="text-[10px]">Statistik umur pegawai aktif mendekati batas pensiun.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted p-2.5 rounded-xl border border-border">
                  <p className="text-xl font-extrabold text-foreground">{stats?.retirementStats.activeCount || 0}</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Aktif (&lt;55)</p>
                </div>
                <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <p className="text-xl font-extrabold text-amber-500">{stats?.retirementStats.approachingCount || 0}</p>
                  <p className="text-[9px] font-bold text-amber-500 uppercase mt-0.5">Siaga (55-57)</p>
                </div>
                <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <p className="text-xl font-extrabold text-rose-500">{stats?.retirementStats.retiredCount || 0}</p>
                  <p className="text-[9px] font-bold text-rose-500 uppercase mt-0.5">Pensiun (&gt;=58)</p>
                </div>
              </div>

              {/* Approach List */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Daftar Pegawai Pensiun / Siaga</p>
                {stats?.retirementList && stats.retirementList.length > 0 ? (
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                    {stats.retirementList.map((u) => (
                      <div
                        key={u.id}
                        className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-colors ${u.status === "PENSIUN"
                          ? "bg-rose-500/5 border-rose-500/10"
                          : "bg-amber-500/5 border-amber-500/10"
                          }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-foreground">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground">NIP: {u.employeeId || "-"} • Usia: <span className="font-bold text-foreground">{u.age} th</span></p>
                        </div>
                        <Badge
                          className={`text-[9px] font-bold px-1.5 py-0.5 border-0 hover:opacity-90 ${u.status === "PENSIUN"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-500 text-white"
                            }`}
                        >
                          {u.status === "PENSIUN" ? "Pensiun" : "Siaga"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground font-semibold italic text-center py-4">
                    Tidak ada pegawai di batas usia pensiun.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <CalendarSection isDashboard={true} />
        </div>
      </div>

      {/* Verify Dialog Modal */}
      <VerifyDocumentModal
        open={verifyOpen}
        onClose={() => {
          setVerifyOpen(false);
          setSelectedDocId(null);
        }}
        documentId={selectedDocId}
        onVerificationSuccess={fetchData}
      />
    </div>
  );
}
