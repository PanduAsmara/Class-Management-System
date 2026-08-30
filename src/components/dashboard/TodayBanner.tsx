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
        return "👑 Mode Developer (Master Access)";
      case "admin":
        return "🛡️ Mode Admin (Pengurus)";
      case "ketua_kelas":
        return "🎓 Ketua Kelas (Pengelola)";
      default:
        return "👤 Mode Mahasiswa";
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-soft-md relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {activeClass ? `${activeClass.name} (Semester ${activeClass.semester})` : "Kelas TMJ"}
            </span>
            <span className="px-3 py-1 bg-white text-blue-900 rounded-full text-xs font-semibold tracking-wide shadow-soft-xs">
              {getRoleLabel()}
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
            Selamat Datang, {currentUser?.name || "Mahasiswa"}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm font-sans mt-2 max-w-xl leading-relaxed">
            Portal terintegrasi kelas <strong className="text-white font-semibold">{activeClass?.name || "TMJ"}</strong> • {settings.organizationName}. Kelola mata kuliah, jadwal, materi, tugas, dan pengumuman dengan mudah.
          </p>
        </div>

        {/* Date Box */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 min-w-[200px]">
          <div className="flex items-center gap-1.5 text-xs text-blue-200 font-medium">
            <Calendar className="w-3.5 h-3.5" /> Hari Ini
          </div>
          <div className="font-heading font-bold text-sm sm:text-base text-white text-right mt-1">
            {todayStr}
          </div>
        </div>
      </div>
    </div>
  );
};
