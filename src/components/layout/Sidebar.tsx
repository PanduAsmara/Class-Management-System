"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Megaphone,
  CheckSquare,
  FolderDown,
  Calendar,
  FileText,
  Settings,
  Sparkles,
  Building2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, getActiveClass } from "@/lib/storage";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const currentUser = getCurrentUser();
  const activeClass = getActiveClass();

  const isDeveloper = currentUser?.role === "developer";

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Mata Kuliah", href: "/courses", icon: BookOpen },
    { label: "Jadwal Kuliah", href: "/schedule", icon: CalendarDays },
    { label: "Pengumuman", href: "/announcements", icon: Megaphone },
    { label: "Tugas & Deadline", href: "/assignments", icon: CheckSquare },
    { label: "Materi & Modul", href: "/materials", icon: FolderDown },
    { label: "Kalender", href: "/calendar", icon: Calendar },
    { label: "Catatan Pribadi", href: "/notes", icon: FileText },
    { label: "Pengaturan", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 h-screen shrink-0 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand & Nav */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-heading font-bold text-xs shadow-soft-sm tracking-tight">
                TMJ
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-bold text-sm text-slate-900 tracking-tight leading-none">
                  TMJ Class SaaS
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Portal Multi-Kelas & Semester
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {/* Developer Special Console Link */}
            {isDeveloper && (
              <div className="mb-3 pb-3 border-b border-slate-100">
                <Link
                  href="/developer"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-xs font-heading font-bold rounded-xl transition-all duration-150 select-none",
                    pathname === "/developer"
                      ? "bg-purple-600 text-white shadow-soft-sm"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80"
                  )}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Developer Console</span>
                </Link>
              </div>
            )}

            <div className="px-3 py-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-400">
              Menu Akademik Kelas
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs font-sans font-medium rounded-xl transition-all duration-150 select-none",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold shadow-soft-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Active Class Badge */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                <span className="font-heading font-semibold text-xs text-slate-800">
                  {activeClass ? activeClass.name : "Belum Ada Kelas"}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-blue-600">
                {activeClass ? `Sem ${activeClass.semester}` : "-"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {activeClass?.academicYear || "Semester Genap 2025/2026"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
