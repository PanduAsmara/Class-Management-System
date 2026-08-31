export type UserRole = 'developer' | 'admin' | 'ketua_kelas' | 'mahasiswa';

export interface ClassCohort {
  id: string;
  name: string; // e.g. "TMJ 1A", "TMJ 4A"
  semester: number; // 1 - 8
  academicYear: string; // e.g. "2025/2026 Genap"
  major: string; // "Teknik Multimedia & Jaringan"
  description?: string;
  leaderId?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string; // Unique login username
  name: string;
  email?: string;
  password?: string;
  nim?: string;
  phoneNumber?: string; // WhatsApp number
  role: UserRole;
  classId?: string; // Associated ClassCohort ID
  classGroup?: string; // Display class name e.g. "TMJ 4A"
  organization?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Course {
  id: string;
  classId?: string; // Associated Class ID
  name: string;
  code: string;
  semester: number; // 1 - 8
  sks: number;
  lecturer: string;
  lecturerNip?: string;
  lecturerContact?: string;
  color: string;
  room: string;
  description?: string;
  syllabus?: string[];
  createdAt?: string;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface Schedule {
  id: string;
  classId?: string;
  courseId: string;
  day: DayOfWeek;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "10:30"
  room: string;
  lecturer: string;
  meetingLink?: string;
  type?: 'Teori' | 'Praktikum' | 'Respons';
}

export type AnnouncementCategory = 'info' | 'reminder' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  classId?: string; // empty means global to all classes
  title: string;
  content: string;
  category: AnnouncementCategory;
  date: string; // ISO or YYYY-MM-DD
  targetCourseId?: string;
  attachments?: {
    name: string;
    url: string;
    type?: string;
  }[];
  author: string;
  pinned?: boolean;
}

export type MaterialAttachmentType = 'pdf' | 'ppt' | 'docx' | 'zip' | 'gdrive' | 'youtube';

export interface Material {
  id: string;
  classId?: string;
  title: string;
  description: string;
  week: number; // 1 to 16
  courseId: string;
  attachmentUrl: string;
  attachmentType: MaterialAttachmentType;
  uploadedAt: string;
  fileSize?: string;
}

export type AssignmentStatus = 'belum_mulai' | 'progress' | 'selesai' | 'terlambat';
export type AssignmentPriority = 'high' | 'medium' | 'low';

export interface Assignment {
  id: string;
  classId?: string;
  title: string;
  description: string;
  deadline: string; // ISO string e.g. 2026-09-05T23:59
  courseId: string;
  attachmentUrl?: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  checklist?: {
    id: string;
    text: string;
    done: boolean;
  }[];
  submissionLink?: string;
  isCompletedByStudent?: boolean;
}

export type CalendarEventType = 'kuliah' | 'uts' | 'uas' | 'deadline' | 'seminar' | 'libur';

export interface CalendarEvent {
  id: string;
  classId?: string;
  title: string;
  type: CalendarEventType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  time?: string;     // e.g. "08:00 - 10:30"
  courseId?: string;
  location?: string;
  description?: string;
}

export interface Note {
  id: string;
  userId?: string;
  classId?: string;
  title: string;
  content: string;
  courseId?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPinned?: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  classId?: string;
  title: string;
  message: string;
  type: 'deadline' | 'announcement' | 'reminder' | 'class';
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
}

export interface UserProfile {
  name: string;
  username?: string;
  nim: string;
  classGroup: string;
  organization: string;
  activeSemester: number;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export type WhatsAppProvider = 'fonnte' | 'wablas' | 'pterodactyl' | 'custom' | 'direct';

export interface WhatsAppConfig {
  provider: WhatsAppProvider;
  apiKey?: string;
  senderPhone?: string;
  targetPhone?: string;
  targetGroupName?: string;
  targetGroupId?: string;
  customWebhookUrl?: string;
  enableAutoDailySchedule: boolean;
  dailyScheduleTime: string; // e.g. "07:00"
  enableAutoDeadlineReminder: boolean;
}

export interface SystemSettings {
  organizationName: string;
  activeSemester: number;
  academicYear: string;
  enableNotifications: boolean;
  enableClassReminders: boolean;
  deadlineAlertHours: number;
  autoSaveNotes: boolean;
  whatsapp?: WhatsAppConfig;
}
