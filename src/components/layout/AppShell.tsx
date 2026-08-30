"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { getCurrentUser, isSetupCompleted } from "@/lib/storage";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. If First-Time Setup is not done yet, force redirect to /setup
    if (!isSetupCompleted() && pathname !== "/setup") {
      router.push("/setup");
      return;
    }

    // 2. If setup is completed but user is not logged in, force redirect to /login
    if (isSetupCompleted() && !getCurrentUser() && pathname !== "/login" && pathname !== "/setup") {
      router.push("/login");
      return;
    }
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
      {/* Pinned Full-Height Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Topbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Independent Smooth Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};
