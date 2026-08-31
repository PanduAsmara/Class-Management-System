"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, ShieldCheck, GraduationCap, Building2 } from "lucide-react";
import { getProfile, getUserRole, getSettings, getActiveClass, subscribeToStore, getCurrentUser } from "@/lib/storage";
import { formatDateIndo } from "@/lib/utils";

export const TodayBanner: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeClass, setActiveClass] = useState(getActiveClass());
  const [settings, setSettings] = useState(getSettings());
  const todayStr = formatDateIndo(new Date().toISOString());

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setActiveClass(getActiveClass());
    setSettings(getSettings());

    const unsubscribe = subscribeToStore(() => {
      setCurrentUser(getCurrentUser());
      setActiveClass(getActiveClass());
      setSettings(getSettings());
    });
    return () => unsubscribe();
  }, []);

  const role = currentUser?.role || "mahasiswa";

  const getRoleLabel = () => {
    switch (role) {
      case "developer":
        return "👑 Developer (Superadmin)";
      case "admin":
        return "🛡️ Mode Admin";
      case "ketua_kelas":
        return "🎓 Ketua Kelas";
      default:
        return "👤 Mode Mahasiswa";
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 mb-5 sm:mb-6 shadow-soft-md relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="px-2.5 sm:px-3 py-1 bg-white/15 backdrop-blur-sm text-white rounded-full text-[11px] sm:text-xs font-medium tracking-wide flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {activeClass ? `${activeClass.name} (Semester ${activeClass.semester})` : "Kelas TMJ"}
            </span>
            <span className="px-2.5 sm:px-3 py-1 bg-white text-blue-900 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide shadow-soft-xs">
              {getRoleLabel()}
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight leading-snug">
            Selamat Datang, {currentUser?.name || "Mahasiswa"}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm font-sans mt-1.5 max-w-xl leading-relaxed">
            Portal terintegrasi kelas <strong className="text-white font-semibold">{activeClass?.name || "TMJ"}</strong> • {settings.organizationName}. Kelola mata kuliah, jadwal, materi, tugas, dan pengumuman dengan mudah.
          </p>
        </div>

        {/* Date Box */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-blue-200 font-medium">
            <Calendar className="w-3.5 h-3.5" /> Hari Ini
          </div>
          <div className="font-heading font-bold text-xs sm:text-sm md:text-base text-white text-right md:mt-1">
            {todayStr}
          </div>
        </div>
      </div>
    </div>
  );
};
