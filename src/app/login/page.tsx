"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  User as UserIcon,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield
} from "lucide-react";
import { login, isSetupCompleted } from "@/lib/storage";
import { BrutalButton } from "@/components/ui/BrutalButton";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupDone, setSetupDone] = useState(true);

  useEffect(() => {
    const isDone = isSetupCompleted();
    setSetupDone(isDone);
    if (!isDone) {
      router.push("/setup");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      if (res.success && res.user) {
        if (res.user.role === "developer") {
          router.push("/developer");
        } else {
          router.push("/");
        }
      } else {
        setError(res.error || "Username / NIM atau password salah. Silakan periksa kembali.");
        setLoading(false);
      }
    }, 300);
  };

  if (!setupDone) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
          <h2 className="font-heading font-bold text-lg text-slate-800">
            Mengarahkan ke Setup Wizard...
          </h2>
          <Link href="/setup">
            <BrutalButton variant="primary" size="sm">Buka Setup Wizard</BrutalButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white items-center justify-center font-heading font-extrabold text-lg shadow-soft-md">
            TMJ
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            TMJ Class Management
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Portal Manajemen Aktivitas & Jadwal Perkuliahan Mahasiswa
          </p>
        </div>

        {/* Secure Login Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-heading font-bold text-lg text-slate-900">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs text-slate-500">
              Gunakan Username atau NIM dan Password Anda
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 block">
                Username atau NIM
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username / NIM (e.g. developer / 220441100088)"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              disabled={loading}
            >
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </BrutalButton>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          Teknik Multimedia & Jaringan • Sistem Autentikasi Aman
        </div>
      </div>
    </div>
  );
}
