"use client";

import React, { useState } from "react";
import {
  Send,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Users,
  User,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { BrutalModal } from "@/components/ui/BrutalModal";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalInput } from "@/components/ui/BrutalInput";
import {
  generateWhatsAppDirectUrl,
  sendWhatsAppMessage,
  normalizePhoneNumber
} from "@/lib/whatsapp-service";
import { getSettings } from "@/lib/storage";

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultMessage: string;
  defaultTargetPhone?: string;
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  title,
  defaultMessage,
  defaultTargetPhone = "",
}) => {
  const [message, setMessage] = useState(defaultMessage);
  const [targetType, setTargetType] = useState<"group" | "personal" | "direct">("group");
  const [targetPhone, setTargetPhone] = useState(defaultTargetPhone);
  const [targetGroup, setTargetGroup] = useState("Grup WA TMJ");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Synchronize default message when opened
  React.useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
      setStatusMessage(null);
      const settings = getSettings();
      if (settings.whatsapp) {
        setTargetPhone(settings.whatsapp.targetPhone || defaultTargetPhone);
        setTargetGroup(settings.whatsapp.targetGroupName || "Grup WA TMJ");
      }
    }
  }, [isOpen, defaultMessage, defaultTargetPhone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsAppDirect = () => {
    const phone = targetType === "personal" ? targetPhone : "";
    const url = generateWhatsAppDirectUrl(phone, message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSendViaGateway = async () => {
    setSending(true);
    setStatusMessage(null);
    const settings = getSettings();
    const config = settings.whatsapp || {
      provider: "direct",
      enableAutoDailySchedule: true,
      dailyScheduleTime: "07:00",
      enableAutoDeadlineReminder: true,
    };

    if (config.provider === "direct" || !config.apiKey) {
      // Fallback to WA Web
      handleOpenWhatsAppDirect();
      setStatusMessage({
        type: "success",
        text: "Membuka WhatsApp Web / Desktop dengan teks pesan siap kirim!",
      });
      setSending(false);
      return;
    }

    const res = await sendWhatsAppMessage(
      config,
      targetType === "personal" ? targetPhone : config.targetGroupId || targetPhone,
      message
    );

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "Pesan broadcast berhasil dikirim via WhatsApp Gateway!",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Gagal mengirim pesan via WhatsApp Gateway",
      });
    }
    setSending(false);
  };

  return (
    <BrutalModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        {/* Target Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTargetType("group")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
              targetType === "group"
                ? "bg-white text-slate-900 shadow-soft-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" /> Grup WhatsApp Kelas
          </button>
          <button
            onClick={() => setTargetType("personal")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
              targetType === "personal"
                ? "bg-white text-slate-900 shadow-soft-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-600" /> Nomor Pribadi / Mahasiswa
          </button>
        </div>

        {targetType === "personal" && (
          <div className="space-y-1">
            <BrutalInput
              label="Nomor WhatsApp Tujuan *"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="081234567890 / 628123456789"
            />
            <div className="text-[10px] text-slate-400">
              Format nomor Indonesia (08... atau 628...)
            </div>
          </div>
        )}

        {/* WhatsApp Phone Mockup Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Pratinjau Tampilan Pesan WhatsApp:
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Salin Teks
                </>
              )}
            </button>
          </div>

          <div className="bg-[#EFEAE2] border border-slate-200 rounded-2xl p-4 shadow-inner">
            <div className="max-w-[92%] ml-auto bg-[#D9FDD3] text-slate-900 rounded-2xl rounded-tr-sm p-3.5 shadow-soft-xs text-xs font-sans whitespace-pre-line leading-relaxed">
              {message}
              <div className="text-[10px] text-slate-500 text-right mt-1.5 flex items-center justify-end gap-1">
                <span>12:00</span>
                <span className="text-blue-500">✓✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Text Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Edit Teks Pesan (Jika Ingin Menambah Catatan):
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Salin Teks
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <BrutalButton
              onClick={handleOpenWhatsAppDirect}
              variant="success"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
              className="w-full sm:w-auto text-xs"
            >
              Buka di WhatsApp Web / App
            </BrutalButton>
          </div>
        </div>
      </div>
    </BrutalModal>
  );
};
