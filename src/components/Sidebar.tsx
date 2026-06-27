"use client";

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
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  // Determine navigation menu items based on role
  const getNavLinks = () => {
    const roles = session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);
    
    const hasAdmin = roles.includes("HR_ADMIN");
    const hasStaff = roles.includes("STAFF");
    const hasEmployee = roles.includes("EMPLOYEE");

    const links = [];

    // 1. Dashboard Link
    if (hasAdmin || hasStaff) {
      links.push({
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      });
    } else if (hasEmployee) {
      links.push({
        href: "/employee/dashboard",
        label: "Dashboard Dokumen",
        icon: FileCheck,
      });
    }

    // 2. Verifikasi Berkas (Admin or Staff)
    if (hasAdmin || hasStaff) {
      links.push({
        href: "/admin/verification",
        label: "Verifikasi Berkas",
        icon: FileCheck,
      });
    }

    // 3. Konfigurasi Dokumen (Admin only)
    if (hasAdmin) {
      links.push({
        href: "/admin/document-types",
        label: "Konfigurasi Dokumen",
        icon: Settings,
      });
    }

    // 4. Audit Log Keamanan (Admin only)
    if (hasAdmin) {
      links.push({
        href: "/admin/security-logs",
        label: "Audit Log Keamanan",
        icon: ShieldAlert,
      });
    }

    // 5. Manajemen Pegawai (Admin only)
    if (hasAdmin) {
      links.push({
        href: "/admin/users",
        label: "Manajemen Pegawai",
        icon: Users,
      });
    }

    // 6. Kalender & Libur (Everyone)
    links.push({
      href: "/calendar",
      label: "Kalender & Libur",
      icon: Calendar,
    });

    // 7. Profil Saya (Everyone)
    links.push({
      href: "/profile",
      label: "Profil Saya",
      icon: User,
    });

    return links;
  };

  const navLinks = getNavLinks();

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
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              style={
                isActive
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
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}
              />
              <span className="whitespace-nowrap">{link.label}</span>
              {isActive && (
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
            {role === "HR_ADMIN" ? "HR Admin" : role === "STAFF" ? "Staff Kepegawaian" : "Pegawai"}
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
