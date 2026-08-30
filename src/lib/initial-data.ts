import {
  Course,
  Schedule,
  Announcement,
  Material,
  Assignment,
  CalendarEvent,
  Note,
  NotificationItem,
  UserProfile,
  SystemSettings,
  ClassCohort
} from "@/types";

export const initialProfile: UserProfile = {
  name: "Pandu Asmara",
  nim: "220441100088",
  classGroup: "TMJ 4A",
  organization: "Teknik Multimedia dan Jaringan (TMJ)",
  activeSemester: 4,
  email: "pandu@student.tmj.ac.id",
};

export const initialSettings: SystemSettings = {
  organizationName: "Teknik Multimedia dan Jaringan (TMJ)",
  activeSemester: 4,
  academicYear: "2025/2026 Genap",
  enableNotifications: true,
  enableClassReminders: true,
  deadlineAlertHours: 24,
  autoSaveNotes: true,
};

// Clean slate arrays (zero dummy data by default)
export const initialClasses: ClassCohort[] = [];
export const initialCourses: Course[] = [];
export const initialSchedules: Schedule[] = [];
export const initialAnnouncements: Announcement[] = [];
export const initialMaterials: Material[] = [];
export const initialAssignments: Assignment[] = [];
export const initialCalendarEvents: CalendarEvent[] = [];
export const initialNotes: Note[] = [];
export const initialNotifications: NotificationItem[] = [];
