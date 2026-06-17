"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background" id="smdp-dashboard-layout">
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:block md:w-72 md:flex-shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* Mobile Drawer Slide-out Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-[#1e2139] border-none text-white" showCloseButton={false}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Right Side Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
