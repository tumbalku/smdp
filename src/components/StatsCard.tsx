"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  variant: "primary" | "success" | "warning" | "danger";
}

export function StatsCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant,
}: StatsCardProps) {
  const getStyles = () => {
    switch (variant) {
      case "primary":
        return {
          borderLeft: "4px solid var(--jobster-accent, #6c63ff)",
          iconBg: "rgba(108, 99, 255, 0.15)",
          iconColor: "var(--jobster-accent, #6c63ff)",
        };
      case "success":
        return {
          borderLeft: "4px solid var(--jobster-success, #22c55e)",
          iconBg: "rgba(34, 197, 94, 0.15)",
          iconColor: "var(--jobster-success, #22c55e)",
        };
      case "warning":
        return {
          borderLeft: "4px solid var(--jobster-warning, #f59e0b)",
          iconBg: "rgba(245, 158, 11, 0.15)",
          iconColor: "var(--jobster-warning, #f59e0b)",
        };
      case "danger":
        return {
          borderLeft: "4px solid var(--jobster-danger, #ef4444)",
          iconBg: "rgba(239, 68, 68, 0.15)",
          iconColor: "var(--jobster-danger, #ef4444)",
        };
    }
  };

  const styles = getStyles();

  return (
    <Card
      className="overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm border border-border"
      style={{ borderLeft: styles.borderLeft }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: styles.iconBg, color: styles.iconColor }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
              {value}
            </p>
            <p className="text-xs font-semibold text-muted-foreground leading-tight truncate">{title}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
          {subtext}
        </p>
      </CardContent>
    </Card>
  );
}
