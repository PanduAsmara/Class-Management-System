"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { getCurrentUser, isSetupCompleted, syncWithSupabaseCloud } from "@/lib/storage";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const initAuthGuard = async () => {
      // Sync cloud state first
      await syncWithSupabaseCloud();

      const user = getCurrentUser();
      const setupDone = isSetupCompleted();

      // 1. If trying to visit /setup but setup is already done globally -> redirect to /login
      if (pathname === "/setup" && setupDone) {
        router.push("/login");
        return;
      }

      // 2. If user is not logged in and not on public pages -> redirect to /login
      if (!user && pathname !== "/login" && pathname !== "/setup") {
        router.push("/login");
        return;
      }
    };

    initAuthGuard();
  }, [pathname, router]);

  if (!mounted) {
    return <div className="h-screen w-screen bg-slate-50" />;
  }

  // If on login or setup page, render clean full-screen view
  if (pathname === "/login" || pathname === "/setup") {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Pinned Full-Height Sidebar (Desktop & Tablet) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Topbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Independent Smooth Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-slate-50">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Native-Feel Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};
