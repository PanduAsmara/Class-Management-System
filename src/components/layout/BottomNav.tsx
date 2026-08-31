"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Megaphone,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Jadwal", href: "/schedule", icon: CalendarDays },
    { label: "Tugas", href: "/assignments", icon: CheckSquare },
    { label: "Info", href: "/announcements", icon: Megaphone },
    { label: "Akun", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-soft-md">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 relative min-w-[54px] select-none",
              isActive
                ? "text-blue-600 font-semibold"
                : "text-slate-400 hover:text-slate-700"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-transform duration-150",
                isActive && "scale-110 text-blue-600"
              )}
            />
            <span className="text-[10px] font-sans font-medium mt-0.5 tracking-tight">
              {item.label}
            </span>

            {/* Active Glow Indicator */}
            {isActive && (
              <span className="absolute -bottom-0.5 w-4 h-1 bg-blue-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
