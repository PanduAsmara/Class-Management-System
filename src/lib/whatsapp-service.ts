import {
  ClassCohort,
  Schedule,
  Course,
  Assignment,
  Announcement,
  WhatsAppConfig,
  DayOfWeek
} from "@/types";
import { formatDateIndo, formatShortDate } from "./utils";

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  provider: "direct",
  apiKey: "",
  senderPhone: "",
  targetPhone: "",
  targetGroupName: "Grup WA TMJ",
  targetGroupId: "",
  customWebhookUrl: "",
  enableAutoDailySchedule: true,
  dailyScheduleTime: "07:00",
  enableAutoDeadlineReminder: true,
};

// Clean phone number format for WhatsApp (e.g. 08123... -> 628123...)
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("+62")) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

// Generate direct wa.me link with prefilled URL-encoded text
export function generateWhatsAppDirectUrl(phone: string, text: string): string {
  const normalized = normalizePhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

// ====================================================================
// 1. DAILY SCHEDULE MESSAGE FORMATTER
// ====================================================================
export function formatDailyScheduleMessage(
  cls: ClassCohort | undefined,
  schedules: Schedule[],
  courses: Course[],
  dayName: DayOfWeek,
  dateStr?: string
): string {
  const className = cls?.name || "Kelas TMJ";
  const dateFormatted = dateStr ? formatDateIndo(dateStr) : dayName;

  if (schedules.length === 0) {
    return [
      `📅 *JADWAL KULIAH HARI ${dayName.toUpperCase()}*`,
      `🏛️ *${className}* • ${dateFormatted}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🎉 *Tidak ada jadwal kuliah hari ini!*`,
      `Waktunya istirahat atau mengerjakan tugas mandiri. ✨`,
      ``,
      `_TMJ Class Management System_`,
    ].join("\n");
  }

  const items = schedules
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((sch, idx) => {
      const course = courses.find((c) => c.id === sch.courseId);
      const courseTitle = course ? `${course.code} - ${course.name}` : "Mata Kuliah";
      const sksText = course ? ` (${course.sks} SKS)` : "";

      let lines = [
        `${idx + 1}. 📘 *${courseTitle}*${sksText}`,
        `   ⏰ *Waktu:* ${sch.startTime} - ${sch.endTime} WIB`,
        `   📍 *Ruang:* ${sch.room}`,
        `   👨‍🏫 *Dosen:* ${sch.lecturer}`,
      ];

      if (sch.meetingLink) {
        lines.push(`   🔗 *Meeting Link:* ${sch.meetingLink}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");

  return [
    `📅 *JADWAL KULIAH HARI INI - ${dayName.toUpperCase()}*`,
    `🏛️ *${className}* • ${dateFormatted}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    items,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💡 _Harap hadir tepat waktu dan persiapkan modul praktikum._`,
    `Semangat kuliah hari ini! 💪`,
    ``,
    `_TMJ Class Management System_`,
  ].join("\n");
}

// ====================================================================
// 2. DEADLINE REMINDER FORMATTER
// ====================================================================
export function formatDeadlineAlertMessage(
  cls: ClassCohort | undefined,
  assignment: Assignment,
  course: Course | undefined
): string {
  const className = cls?.name || "Kelas TMJ";
  const courseName = course ? `${course.code} - ${course.name}` : "Mata Kuliah";

  const checklistText =
    assignment.checklist && assignment.checklist.length > 0
      ? [
          ``,
          `📝 *Checklist Tugas:*`,
          ...assignment.checklist.map((c) => `   ${c.done ? "✅" : "⬜"} ${c.text}`),
        ].join("\n")
      : "";

  const submissionText = assignment.submissionLink
    ? `\n📤 *Link Pengumpulan:* ${assignment.submissionLink}`
    : "";

  return [
    `🚨 *PENGINGAT DEADLINE TUGAS (H-1)*`,
    `🏛️ *${className}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 *Tugas:* ${assignment.title}`,
    `📚 *Mata Kuliah:* ${courseName}`,
    `⏰ *Batas Waktu:* ${formatDateIndo(assignment.deadline)} (${formatShortDate(assignment.deadline)})`,
    `⚡ *Prioritas:* ${assignment.priority.toUpperCase()}`,
    checklistText,
    submissionText,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ _Segera selesaikan dan submit tugas Anda sebelum batas waktu berakhir!_`,
    ``,
    `_TMJ Class Management System_`,
  ].join("\n");
}

// ====================================================================
// 3. ANNOUNCEMENT BROADCAST FORMATTER
// ====================================================================
export function formatAnnouncementMessage(
  cls: ClassCohort | undefined,
  announcement: Announcement,
  course?: Course
): string {
  const className = cls?.name || "Kelas TMJ";
  const badgeIcon =
    announcement.category === "urgent"
      ? "🔴 URGENT"
      : announcement.category === "important"
      ? "🟡 PENTING"
      : "📢 PENGUMUMAN";

  const targetCourseText = course ? `\n🎯 *Target:* ${course.code} - ${course.name}` : "";

  const attachmentText =
    announcement.attachments && announcement.attachments.length > 0
      ? [
          ``,
          `📎 *Lampiran Berkas:*`,
          ...announcement.attachments.map((att) => `   - ${att.name}: ${att.url}`),
        ].join("\n")
      : "";

  return [
    `📢 *${badgeIcon} - INFORMASI KELAS*`,
    `🏛️ *${className}* • ${formatDateIndo(announcement.date)}`,
    targetCourseText,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 *${announcement.title}*`,
    ``,
    `${announcement.content}`,
    attachmentText,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Diposting oleh:* ${announcement.author}`,
    ``,
    `_TMJ Class Management System_`,
  ].join("\n");
}

// ====================================================================
// 4. SEND WHATSAPP MESSAGE DISPATCHER
// ====================================================================
export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  targetPhone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: config.provider,
        apiKey: config.apiKey,
        targetPhone: normalizePhoneNumber(targetPhone || config.targetPhone),
        targetGroupId: config.targetGroupId,
        message,
        customWebhookUrl: config.customWebhookUrl,
      }),
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Gagal menghubungi server WhatsApp Gateway",
    };
  }
}
