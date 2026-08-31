"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Smartphone,
  Save,
  CheckCircle2,
  Send,
  Key,
  Users,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Server
} from "lucide-react";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { BrutalSelect } from "@/components/ui/BrutalSelect";
import { WhatsAppConfig, WhatsAppProvider } from "@/types";
import { getSettings, saveSettings } from "@/lib/storage";
import { sendWhatsAppMessage, DEFAULT_WHATSAPP_CONFIG } from "@/lib/whatsapp-service";

export const WhatsAppConfigCard: React.FC = () => {
  const settings = getSettings();
  const [config, setConfig] = useState<WhatsAppConfig>(
    settings.whatsapp || DEFAULT_WHATSAPP_CONFIG
  );
  const [saved, setSaved] = useState(false);
  const [testPhone, setTestPhone] = useState(config.targetPhone || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      ...settings,
      whatsapp: config,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestMessage = async () => {
    if (!testPhone.trim()) {
      setTestResult({ success: false, text: "Masukkan nomor WhatsApp uji coba terlebih dahulu." });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const testMessage = [
      `🤖 *TEST KONEKSI WHATSAPP BOT*`,
      `🏛️ *TMJ Class Management System*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `✅ Selamat! Gateway WhatsApp Bot TMJ berhasil terhubung dan siap digunakan untuk broadcast jadwal, deadline tugas, dan pengumuman kelas.`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Waktu uji: ${new Date().toLocaleTimeString()} WIB_`,
    ].join("\n");

    const res = await sendWhatsAppMessage(config, testPhone, testMessage);
    if (res.success) {
      setTestResult({
        success: true,
        text: `Berhasil! Pesan tes telah dikirim ke ${testPhone}.`,
      });
    } else {
      setTestResult({
        success: false,
        text: res.error || "Gagal mengirim pesan tes.",
      });
    }
    setTesting(false);
  };

  return (
    <BrutalCard
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi WhatsApp Bot & Broadcast Kelas</span>
          </div>
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
            </span>
          )}
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BrutalSelect
            label="Provider WhatsApp Gateway *"
            value={config.provider}
            onChange={(e) => setConfig({ ...config, provider: e.target.value as WhatsAppProvider })}
            options={[
              { label: "🚀 Pterodactyl Baileys Bot (Node.js Server Port 2266)", value: "pterodactyl" },
              { label: "🟢 WhatsApp Web / App Direct (Free / Zero Config)", value: "direct" },
              { label: "⚡ Fonnte API (Indonesia WA Gateway)", value: "fonnte" },
              { label: "🌐 Custom REST API / Baileys Webhook", value: "custom" },
            ]}
          />

          <BrutalInput
            label="Nama Target Grup WhatsApp"
            value={config.targetGroupName || ""}
            onChange={(e) => setConfig({ ...config, targetGroupName: e.target.value })}
            placeholder="e.g. Grup WA TMJ-1A"
          />

          {config.provider === "pterodactyl" && (
            <>
              <div className="sm:col-span-2">
                <BrutalInput
                  label="URL Server Pterodactyl Bot *"
                  value={config.customWebhookUrl || ""}
                  onChange={(e) => setConfig({ ...config, customWebhookUrl: e.target.value })}
                  placeholder="e.g. http://hostingservice.tech:2266 atau http://IP_NODE:2266"
                  required
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Masukkan domain atau IP node Pterodactyl Anda beserta port <code>:2266</code>.
                </div>
              </div>

              <div className="sm:col-span-2">
                <BrutalInput
                  label="API Secret Key *"
                  type="password"
                  value={config.apiKey || "tmj-secret-bot-2026"}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="tmj-secret-bot-2026"
                  required
                />
              </div>
            </>
          )}

          {config.provider === "fonnte" && (
            <div className="sm:col-span-2">
              <BrutalInput
                label="API Token Fonnte *"
                type="password"
                value={config.apiKey || ""}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Token API dari Fonnte"
                required
              />
            </div>
          )}

          {config.provider === "custom" && (
            <>
              <div className="sm:col-span-2">
                <BrutalInput
                  label="Custom Webhook URL Endpoint *"
                  value={config.customWebhookUrl || ""}
                  onChange={(e) => setConfig({ ...config, customWebhookUrl: e.target.value })}
                  placeholder="https://your-bot-server.com/send"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <BrutalInput
                  label="API Key / Bearer Token"
                  type="password"
                  value={config.apiKey || ""}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Secret Token"
                />
              </div>
            </>
          )}

          <div>
            <BrutalInput
              label="Nomor WhatsApp Default Ketua Kelas / Admin"
              value={config.targetPhone || ""}
              onChange={(e) => setConfig({ ...config, targetPhone: e.target.value })}
              placeholder="081234567890"
            />
          </div>

          <div>
            <BrutalInput
              label="Waktu Pengingat Jadwal Harian Pagi"
              type="time"
              value={config.dailyScheduleTime || "07:00"}
              onChange={(e) => setConfig({ ...config, dailyScheduleTime: e.target.value })}
            />
          </div>
        </div>

        {/* Automated Notifications Checkboxes */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={config.enableAutoDailySchedule}
              onChange={(e) =>
                setConfig({ ...config, enableAutoDailySchedule: e.target.checked })
              }
              className="minimal-check"
            />
            <div>
              <div className="font-semibold text-xs text-slate-900">
                Otomatiskan Reminder Jadwal Kuliah Harian
              </div>
              <div className="text-[11px] text-slate-500">
                Buat template jadwal kuliah siap kirim setiap pagi
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={config.enableAutoDeadlineReminder}
              onChange={(e) =>
                setConfig({ ...config, enableAutoDeadlineReminder: e.target.checked })
              }
              className="minimal-check"
            />
            <div>
              <div className="font-semibold text-xs text-slate-900">
                Aktifkan Peringatan Deadline Tugas H-1
              </div>
              <div className="text-[11px] text-slate-500">
                Notifikasi peringatan 24 jam sebelum batas waktu pengumpulan tugas
              </div>
            </div>
          </label>
        </div>

        {/* Test Connection Box */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
          <div className="font-heading font-bold text-xs text-emerald-950 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" /> Uji Coba Kirim Pesan Tes WhatsApp:
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Nomor WA Uji Coba (e.g. 081234567890)"
              className="flex-1 px-3 py-2 text-xs bg-white border border-emerald-200 rounded-xl outline-none"
            />
            <button
              type="button"
              onClick={handleTestMessage}
              disabled={testing}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
              <span>{testing ? "Mengirim..." : "Kirim Pesan Tes"}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                testResult.success
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-rose-100 text-rose-900 border border-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              )}
              <span>{testResult.text}</span>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <BrutalButton type="submit" variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
            Simpan Konfigurasi WhatsApp
          </BrutalButton>
        </div>
      </form>
    </BrutalCard>
  );
};
