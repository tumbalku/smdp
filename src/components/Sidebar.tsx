"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
  User,
  LogOut,
  X,
  FileCheck,
  Calendar,
  ChevronDown,
  ChevronRight,
  Shield,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose?: () => void;
}

interface NavSubItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles: string[];
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  subItems?: NavSubItem[];
}

/**
 * Konfigurasi navigasi berbasis role dengan dukungan sub-menu.
 */
const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["HR_ADMIN", "STAFF", "EMPLOYEE"],
    subItems: [
      {
        href: "/dashboard/administrasi",
        label: "Administrasi",
        icon: Shield,
        roles: ["HR_ADMIN", "STAFF"],
      },
      {
        href: "/dashboard/pegawai",
        label: "Pegawai",
        icon: UserCheck,
        roles: ["EMPLOYEE"],
      },
    ],
  },
  {
    href: "/verification",
    label: "Verifikasi Berkas",
    icon: FileCheck,
    roles: ["HR_ADMIN", "STAFF"],
  },
  {
    href: "/document-types",
    label: "Konfigurasi Dokumen",
    icon: Settings,
    roles: ["HR_ADMIN"],
  },
  {
    href: "/security-logs",
    label: "Audit Log Keamanan",
    icon: ShieldAlert,
    roles: ["HR_ADMIN"],
  },
  {
    href: "/users",
    label: "Manajemen Pegawai",
    icon: Users,
    roles: ["HR_ADMIN"],
  },
  {
    href: "/calendar",
    label: "Kalender & Libur",
    icon: Calendar,
    roles: ["HR_ADMIN", "STAFF", "EMPLOYEE"],
  },
  {
    href: "/profile",
    label: "Profil Saya",
    icon: User,
    roles: ["HR_ADMIN", "STAFF", "EMPLOYEE"],
  },
];

const ROLE_LABELS: Record<string, string> = {
  HR_ADMIN: "HR Admin",
  STAFF: "Staff Kepegawaian",
  EMPLOYEE: "Pegawai",
};

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const roles: string[] = session?.user?.roles?.length
    ? session.user.roles
    : role
      ? [role]
      : [];

  const [dashboardOpen, setDashboardOpen] = useState(true);

  // Filter menu utama berdasarkan role user
  const navLinks = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );

  return (
    <div
      className="flex flex-col h-full border-r border-white/5"
      style={{ background: "var(--jobster-sidebar-bg, #1e2139)" }}
      id="smdp-sidebar"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg"
            style={{ background: "var(--jobster-accent, #6c63ff)" }}
          >
            S
          </div>
          <div>
            <p className="font-bold text-white text-base leading-none tracking-wide">
              SMDP Portal
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Sistem Manajemen Dokumen
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 md:hidden"
            id="smdp-sidebar-close"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isParentActive = pathname === link.href || pathname.startsWith(link.href + "/");

          // Filter subItems berdasarkan role user jika ada
          const allowedSubItems = link.subItems
            ? link.subItems.filter((sub) => sub.roles.some((r) => roles.includes(r)))
            : [];

          if (allowedSubItems.length > 0) {
            return (
              <div key={link.href} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group text-white/60 hover:text-white hover:bg-white/10"
                  )}
                  id={`sidebar-link-${link.href.replace(/\//g, "-")}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    <span className="whitespace-nowrap">{link.label}</span>
                  </div>
                  {dashboardOpen ? (
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white" />
                  )}
                </button>

                {/* Sub Menu Links */}
                {dashboardOpen && (
                  <div className="pl-6 space-y-1 pt-0.5">
                    {allowedSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 group",
                            isSubActive
                              ? "text-white bg-white/15 shadow-xs border-l-2 border-[#6c63ff]"
                              : "text-white/50 hover:text-white hover:bg-white/10"
                          )}
                          id={`sidebar-sublink-${sub.href.replace(/\//g, "-")}`}
                        >
                          {SubIcon && (
                            <SubIcon className={cn("w-4 h-4 flex-shrink-0", isSubActive ? "text-[#6c63ff]" : "text-white/40 group-hover:text-white")} />
                          )}
                          <span className="whitespace-nowrap">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isParentActive
                  ? "text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              style={
                isParentActive
                  ? {
                      background: "var(--jobster-accent, #6c63ff)",
                      boxShadow: "0 4px 15px rgba(108,99,255,0.35)",
                    }
                  : {}
              }
              id={`sidebar-link-${link.href.replace(/\//g, "-")}`}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                  isParentActive ? "scale-110" : "group-hover:scale-110"
                )}
              />
              <span className="whitespace-nowrap">{link.label}</span>
              {isParentActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer Section */}
      <div className="px-4 py-5 border-t border-white/10 flex flex-col gap-3">
        <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Role Anda</p>
          <p className="text-xs text-white/80 font-bold tracking-wide mt-0.5">
            {ROLE_LABELS[role ?? ""] ?? role ?? "—"}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 group"
          id="sidebar-logout-button"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <span className="whitespace-nowrap">Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );
}
