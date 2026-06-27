import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminStats } from "../types";

interface RetirementMonitorProps {
  stats: AdminStats | null;
}

export function RetirementMonitor({ stats }: RetirementMonitorProps) {
  return (
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
    </div>
  );
}
