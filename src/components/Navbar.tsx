"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/document-types": "Konfigurasi Dokumen",
  "/security-logs": "Audit Log Keamanan",
  "/users": "Manajemen Pegawai",
  "/categories": "Kelola Kategori Kepegawaian",
  "/verification": "Verifikasi Berkas",
  "/profile": "Profil Saya",
};

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const pageTitle = pageTitles[pathname] ?? "SMDP Kepegawaian";
  const userName = session?.user?.name ?? "Pegawai SMDP";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getDashboardHref = () => {
    return "/dashboard";
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center gap-4 px-4 md:px-6 shadow-xs"
      id="smdp-navbar"
    >
      {/* Mobile Menu Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-muted-foreground hover:text-foreground"
        onClick={onMenuClick}
        id="navbar-mobile-toggle"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page Heading Title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-foreground tracking-tight" id="navbar-page-title">
          {pageTitle}
        </h1>
        <p className="text-[11px] text-muted-foreground hidden sm:block">
          Sistem Informasi Manajemen Dokumen Kepegawaian
        </p>
      </div>

      {/* Actions (Notifications & User Avatar Dropdown) */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Alert Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          id="navbar-notification-bell"
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: "var(--jobster-danger, #ef4444)" }}
          />
        </Button>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors duration-200 group outline-none"
                id="navbar-user-dropdown-trigger"
              />
            }
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback
                className="text-white text-xs font-bold"
                style={{ background: "var(--jobster-accent, #6c63ff)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[120px] truncate">
                {session?.user?.email}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground ml-1 hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" id="navbar-user-dropdown-content">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="font-semibold text-xs">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              id="dropdown-link-profile"
            >
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(getDashboardHref())}
              id="dropdown-link-dashboard"
            >
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
              id="dropdown-link-logout"
            >
              Keluar (Logout)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
