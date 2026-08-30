"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  GraduationCap
} from "lucide-react";
import { isSetupCompleted, completeSetup, syncWithSupabaseCloud } from "@/lib/storage";
import { checkGlobalSetupStatus } from "@/lib/supabase-service";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalInput } from "@/components/ui/BrutalInput";

interface InitialClassItem {
  name: string;
  semester: number;
  major: string;
}

export default function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checking, setChecking] = useState(true);

  // Step 1: Developer Account
  const [devUsername, setDevUsername] = useState("developer");
  const [devName, setDevName] = useState("Developer Master");
  const [devPassword, setDevPassword] = useState("dev123");

  // Step 2: Organization & Classes
  const [orgName, setOrgName] = useState("Teknik Multimedia dan Jaringan (TMJ)");
  const [classList, setClassList] = useState<InitialClassItem[]>([
    { name: "TMJ 1A", semester: 1, major: "Teknik Multimedia dan Jaringan" },
    { name: "TMJ 2A", semester: 2, major: "Teknik Multimedia dan Jaringan" },
    { name: "TMJ 3A", semester: 3, major: "Teknik Multimedia dan Jaringan" },
    { name: "TMJ 4A", semester: 4, major: "Teknik Multimedia dan Jaringan" },
  ]);

  const [newClassName, setNewClassName] = useState("");
  const [newClassSemester, setNewClassSemester] = useState(1);

  useEffect(() => {
    const checkSetupLock = async () => {
      await syncWithSupabaseCloud();
      const { setupCompleted, developerExists } = await checkGlobalSetupStatus();
      if (setupCompleted || developerExists || isSetupCompleted()) {
        router.push("/login");
        return;
      }
      setChecking(false);
    };

    checkSetupLock();
  }, [router]);

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    setClassList([
      ...classList,
      {
        name: newClassName.trim(),
        semester: Number(newClassSemester),
        major: orgName,
      },
    ]);
    setNewClassName("");
  };

  const handleRemoveClass = (index: number) => {
    setClassList(classList.filter((_, idx) => idx !== index));
  };

  const handleFinishSetup = () => {
    completeSetup({
      developer: {
        username: devUsername.trim().toLowerCase(),
        name: devName,
        password: devPassword,
      },
      organizationName: orgName,
      classes: classList,
    });

    router.push("/developer");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memeriksa status inisialisasi sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Decorative Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-2xl z-10 space-y-6">
        {/* Wizard Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white items-center justify-center font-heading font-extrabold text-lg shadow-soft-md">
            TMJ
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            SaaS Initialization Wizard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Inisialisasi Master Developer Account & Konfigurasi Kelas Semester 1 s.d 8
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border border-slate-200/80 rounded-2xl shadow-soft-xs text-xs font-medium">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "font-bold text-slate-900" : "text-slate-500"}>
              Akun Developer
            </span>
          </div>

          <div className="h-0.5 w-12 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "font-bold text-slate-900" : "text-slate-500"}>
              Struktur Kelas
            </span>
          </div>

          <div className="h-0.5 w-12 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step === 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "font-bold text-slate-900" : "text-slate-500"}>
              Konfirmasi
            </span>
          </div>
        </div>

        {/* Wizard Card Content */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card p-6 sm:p-8 space-y-6">
          {/* STEP 1: DEVELOPER ACCOUNT */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> 1. Akun Master Developer
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Akun ini memegang hak akses tertinggi (Superadmin) untuk mengelola seluruh struktur kelas, menambahkan akun admin, ketua kelas, dan mahasiswa.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <BrutalInput
                  label="Username Login Developer *"
                  value={devUsername}
                  onChange={(e) => setDevUsername(e.target.value)}
                  placeholder="developer / dev / admin"
                  required
                />

                <BrutalInput
                  label="Nama Lengkap *"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  placeholder="Nama Developer / Superadmin"
                  required
                />

                <BrutalInput
                  label="Password Developer *"
                  type="password"
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  placeholder="Password login"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <BrutalButton
                  onClick={() => setStep(2)}
                  variant="primary"
                  size="md"
                  disabled={!devUsername.trim() || !devName.trim() || !devPassword.trim()}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Lanjut ke Struktur Kelas
                </BrutalButton>
              </div>
            </div>
          )}

          {/* STEP 2: CLASSES & COHORTS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" /> 2. Nama Organisasi & Kelas Awal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tentukan nama program studi dan kelas-kelas yang ingin diaktifkan (Semester 1 s.d 8). Anda selalu bisa menambah/mengubah kelas nanti di Developer Console.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <BrutalInput
                  label="Nama Program Studi / Organisasi *"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Teknik Multimedia dan Jaringan"
                  required
                />

                {/* Add Custom Class Quick Bar */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Tambah Kelas / Rombel Baru:
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Nama Kelas (e.g. TMJ 5A)"
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                    />
                    <select
                      value={newClassSemester}
                      onChange={(e) => setNewClassSemester(Number(e.target.value))}
                      className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddClass}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1" /> Tambah
                    </button>
                  </div>
                </div>

                {/* Active Initial Classes List */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Daftar Kelas yang Akan Dibuat ({classList.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {classList.map((cls, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-soft-xs"
                      >
                        <div>
                          <div className="font-heading font-bold text-xs text-slate-900">
                            {cls.name}
                          </div>
                          <div className="text-[11px] text-blue-600 font-medium">
                            Semester {cls.semester}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveClass(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <BrutalButton
                  onClick={() => setStep(1)}
                  variant="neutral"
                  size="md"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Kembali
                </BrutalButton>
                <BrutalButton
                  onClick={() => setStep(3)}
                  variant="primary"
                  size="md"
                  disabled={classList.length === 0}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Konfirmasi & Review
                </BrutalButton>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 3. Siap Meluncurkan TMJ Class CMS
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sistem akan diinisialisasi dalam kondisi <strong>Clean Slate (0 data palsu)</strong>. Anda dapat langsung menambahkan mata kuliah dan jadwal asli.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Username Developer:</span>
                  <span className="font-semibold text-slate-800 font-mono">{devUsername}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-semibold text-slate-800">{devName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Organisasi:</span>
                  <span className="font-semibold text-slate-800">{orgName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Total Kelas Awal:</span>
                  <span className="font-semibold text-blue-600">{classList.length} Kelas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Data Awal:</span>
                  <span className="font-semibold text-emerald-600">Clean Slate (0 Dummy Records)</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <BrutalButton
                  onClick={() => setStep(2)}
                  variant="neutral"
                  size="md"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Kembali
                </BrutalButton>
                <BrutalButton
                  onClick={handleFinishSetup}
                  variant="primary"
                  size="lg"
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Selesaikan Setup & Masuk
                </BrutalButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
