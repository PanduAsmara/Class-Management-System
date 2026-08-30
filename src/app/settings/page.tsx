"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Bell,
  Save,
  CheckCircle2,
  Building2,
  ShieldCheck
} from "lucide-react";
import {
  getProfile,
  saveProfile,
  getSettings,
  saveSettings,
  getUserRole,
  getCurrentUser,
  getActiveClass,
  subscribeToStore
} from "@/lib/storage";
import { UserProfile, SystemSettings, UserRole, ClassCohort, AuthUser } from "@/types";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { BrutalButton } from "@/components/ui/BrutalButton";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [settings, setSettings] = useState<SystemSettings>(getSettings());
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(getActiveClass());
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setProfile(getProfile());
    setSettings(getSettings());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setCurrentUser(getCurrentUser());
      setProfile(getProfile());
      setSettings(getSettings());
      setActiveClass(getActiveClass());
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const role = currentUser?.role || "mahasiswa";

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Pengaturan Akun & Profil
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Informasi Profil Mahasiswa, Kelas Terdaftar, & Preferensi Notifikasi
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Pengaturan Berhasil Disimpan!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Account Info & Role Badge */}
        <BrutalCard
          header={
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Informasi Akun & Hak Akses</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Role Akun</div>
              <div className="font-heading font-bold text-sm text-slate-800 capitalize mt-1">
                {role.replace("_", " ")}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Kelas Terdaftar</div>
              <div className="font-heading font-bold text-sm text-blue-600 mt-1">
                {activeClass ? `${activeClass.name} (Semester ${activeClass.semester})` : "Global"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Tahun Akademik</div>
              <div className="font-heading font-bold text-sm text-slate-800 mt-1">
                {activeClass?.academicYear || settings.academicYear}
              </div>
            </div>
          </div>
        </BrutalCard>

        {/* 2. User Profile */}
        <BrutalCard
          header={
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Informasi Pribadi</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <BrutalInput
                label="Nama Lengkap *"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div>
              <BrutalInput
                label="NIM (Nomor Induk Mahasiswa)"
                value={profile.nim}
                onChange={(e) => setProfile({ ...profile, nim: e.target.value })}
              />
            </div>

            <div>
              <BrutalInput
                label="Nama Kelas / Rombel"
                value={profile.classGroup}
                onChange={(e) => setProfile({ ...profile, classGroup: e.target.value })}
              />
            </div>

            <div>
              <BrutalInput
                label="Program Studi"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <BrutalInput
                label="Alamat Email Kampus"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>
        </BrutalCard>

        {/* 3. Notification Preferences */}
        <BrutalCard
          header={
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Preferensi Notifikasi Perkuliahan</span>
            </div>
          }
        >
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, enableNotifications: e.target.checked })
                }
                className="minimal-check"
              />
              <div>
                <div className="font-semibold text-xs text-slate-900">
                  Aktifkan Notifikasi Website
                </div>
                <div className="text-[11px] text-slate-500">
                  Tampilkan lonceng peringatan untuk deadline dan pengumuman baru
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.enableClassReminders}
                onChange={(e) =>
                  setSettings({ ...settings, enableClassReminders: e.target.checked })
                }
                className="minimal-check"
              />
              <div>
                <div className="font-semibold text-xs text-slate-900">
                  Pengingat Kelas Harian
                </div>
                <div className="text-[11px] text-slate-500">
                  Munculkan jadwal kuliah hari ini secara otomatis
                </div>
              </div>
            </label>
          </div>
        </BrutalCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <BrutalButton type="submit" variant="primary" size="lg" icon={<Save className="w-4 h-4" />}>
            Simpan Pengaturan
          </BrutalButton>
        </div>
      </form>
    </div>
  );
}
