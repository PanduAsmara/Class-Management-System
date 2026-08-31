"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share2, PlusSquare, MoreVertical } from "lucide-react";

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isAppStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isAppStandalone);

    // 2. Device Detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // 3. Register Service Worker immediately
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => console.warn("Service Worker error:", err));
    }

    // 4. Capture Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If on mobile (Android or iOS) and not standalone, show banner after 1.5s delay
    if (!isAppStandalone && (isAndroidDevice || isIosDevice)) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      // If deferredPrompt hasn't fired yet on Android Chrome, show friendly Android guide
      setShowAndroidGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-soft-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-soft-xs">
              TMJ
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white leading-tight">
                Install Aplikasi TMJ Class
              </h4>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                Buka lebih cepat & lancar langsung dari layar utama HP Anda!
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
          >
            Nanti Saja
          </button>

          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-heading font-semibold text-xs rounded-xl shadow-soft-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Sekarang</span>
          </button>
        </div>
      </div>

      {/* Android Step-by-Step Guide Modal (Fallback if Chrome prompt hasn't triggered yet) */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-soft-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span>Install di Android</span>
              </h3>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-heading font-bold text-blue-600 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Ketuk titik tiga (<MoreVertical className="w-3.5 h-3.5 inline text-blue-600" />) di <strong>pojok kanan atas Chrome</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-heading font-bold text-blue-600 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  Pilih menu <strong>&quot;Install app&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-heading font-bold text-blue-600 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  Ketuk <strong>Install</strong>. Aplikasi TMJ Class akan langsung terpasang di Homescreen & menu HP Anda!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowAndroidGuide(false);
                setShowBanner(false);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold text-xs rounded-xl shadow-soft-xs transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* iOS Step-by-Step Guided Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-soft-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span>Install di iPhone / iPad</span>
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-heading font-bold text-blue-600 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Buka browser <strong>Safari</strong>, lalu ketuk tombol <strong>Share</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-600" />) di baris bawah Safari.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-heading font-bold text-blue-600 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  Gulir ke bawah dan pilih <strong>&quot;Add to Home Screen&quot;</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />).
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-heading font-bold text-blue-600 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  Ketuk <strong>Add</strong> di pojok kanan atas. Ikon aplikasi TMJ akan langsung muncul di Homescreen iPhone Anda!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIosGuide(false);
                setShowBanner(false);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold text-xs rounded-xl shadow-soft-xs transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
