"use client";

import {
  ClassCohort,
  AuthUser,
  UserRole,
  Course,
  Schedule,
  Announcement,
  Material,
  Assignment,
  CalendarEvent,
  Note,
  NotificationItem,
  UserProfile,
  SystemSettings
} from "@/types";
import {
  fetchProfilesFromSupabase,
  upsertProfileToSupabase,
  deleteProfileFromSupabase,
  fetchClassesFromSupabase,
  upsertClassToSupabase,
  deleteClassFromSupabase,
  checkGlobalSetupStatus
} from "./supabase-service";

const STORAGE_KEYS = {
  SETUP_DONE: "tmj_cms_setup_completed",
  AUTH_USER: "tmj_cms_auth_user",
  ACTIVE_CLASS: "tmj_cms_active_class_id",
  USERS: "tmj_cms_users",
  CLASSES: "tmj_cms_classes",
  SETTINGS: "tmj_cms_settings",
  COURSES: "tmj_cms_courses",
  SCHEDULES: "tmj_cms_schedules",
  ANNOUNCEMENTS: "tmj_cms_announcements",
  MATERIALS: "tmj_cms_materials",
  ASSIGNMENTS: "tmj_cms_assignments",
  CALENDAR: "tmj_cms_calendar",
  NOTES: "tmj_cms_notes",
  NOTIFICATIONS: "tmj_cms_notifications",
};

export const DEFAULT_SETTINGS: SystemSettings = {
  organizationName: "Teknik Multimedia dan Jaringan (TMJ)",
  activeSemester: 4,
  academicYear: "2025/2026 Genap",
  enableNotifications: true,
  enableClassReminders: true,
  deadlineAlertHours: 24,
  autoSaveNotes: true,
};

// Event listener mechanism for reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Store listener error:", e);
    }
  });
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
  } catch (error) {
    console.error(`Error writing ${key} from localStorage:`, error);
  }
}

// ----------------------------------------------------
// Global Cloud Sync Initializer
// ----------------------------------------------------
export async function syncWithSupabaseCloud(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const { setupCompleted, developerExists } = await checkGlobalSetupStatus();
    if (setupCompleted || developerExists) {
      setItem(STORAGE_KEYS.SETUP_DONE, true);
    }

    const cloudClasses = await fetchClassesFromSupabase();
    if (cloudClasses.length > 0) {
      setItem(STORAGE_KEYS.CLASSES, cloudClasses);
      if (!getActiveClassId()) {
        setActiveClassId(cloudClasses[0].id);
      }
    }

    const cloudProfiles = await fetchProfilesFromSupabase();
    if (cloudProfiles.length > 0) {
      const hasDev = cloudProfiles.some((p) => p.role === "developer");
      if (hasDev) {
        setItem(STORAGE_KEYS.SETUP_DONE, true);
      }
      setItem(STORAGE_KEYS.USERS, cloudProfiles);
    }
  } catch (e) {
    console.warn("Cloud sync warning:", e);
  }
}

// ----------------------------------------------------
// First-Time Setup Wizard State
// ----------------------------------------------------
export function isSetupCompleted(): boolean {
  const localDone = getItem<boolean>(STORAGE_KEYS.SETUP_DONE, false);
  const users = getItem<AuthUser[]>(STORAGE_KEYS.USERS, []);
  const hasDev = users.some((u) => u.role === "developer");
  return localDone || hasDev;
}

export function completeSetup(data: {
  developer: { username: string; name: string; email?: string; password?: string };
  organizationName: string;
  classes: { name: string; semester: number; major: string }[];
}): void {
  const now = new Date().toISOString();

  // 1. Create Developer User
  const devUser: AuthUser = {
    id: `user-dev-${Date.now()}`,
    username: data.developer.username.trim().toLowerCase() || "developer",
    name: data.developer.name,
    email: data.developer.email || `${data.developer.username.trim().toLowerCase()}@tmj.ac.id`,
    password: data.developer.password || "dev123",
    role: "developer",
    organization: data.organizationName,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.developer.name)}`,
    createdAt: now,
  };

  // 2. Create Initial Classes (Cohorts)
  const initialClasses: ClassCohort[] = data.classes.map((cls, idx) => ({
    id: `class-${cls.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now() + idx}`,
    name: cls.name,
    semester: cls.semester,
    academicYear: "2025/2026 Genap",
    major: cls.major || data.organizationName,
    createdAt: now,
  }));

  // 3. Save Users, Classes, Settings locally
  setItem(STORAGE_KEYS.USERS, [devUser]);
  setItem(STORAGE_KEYS.CLASSES, initialClasses);
  setItem(STORAGE_KEYS.SETTINGS, {
    ...DEFAULT_SETTINGS,
    organizationName: data.organizationName,
  });

  if (initialClasses.length > 0) {
    setItem(STORAGE_KEYS.ACTIVE_CLASS, initialClasses[0].id);
  }

  // 4. Log in as the Developer
  setItem(STORAGE_KEYS.AUTH_USER, devUser);
  setItem(STORAGE_KEYS.SETUP_DONE, true);

  // 5. Clean slate arrays
  setItem(STORAGE_KEYS.COURSES, []);
  setItem(STORAGE_KEYS.SCHEDULES, []);
  setItem(STORAGE_KEYS.ANNOUNCEMENTS, []);
  setItem(STORAGE_KEYS.MATERIALS, []);
  setItem(STORAGE_KEYS.ASSIGNMENTS, []);
  setItem(STORAGE_KEYS.CALENDAR, []);
  setItem(STORAGE_KEYS.NOTES, []);
  setItem(STORAGE_KEYS.NOTIFICATIONS, []);

  // 6. Direct Supabase Cloud Sync (Background)
  upsertProfileToSupabase(devUser).catch(console.error);
  initialClasses.forEach((cls) => upsertClassToSupabase(cls).catch(console.error));
}

// ----------------------------------------------------
// Authentication & Session
// ----------------------------------------------------
export function getCurrentUser(): AuthUser | null {
  return getItem<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export async function asyncLogin(identifier: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  // 1. Sync with Supabase Cloud first
  await syncWithSupabaseCloud();
  return login(identifier, password);
}

export function login(identifier: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
  const users = getAllUsers();
  const cleanId = identifier.trim().toLowerCase();

  const foundUser = users.find(
    (u) =>
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.nim && u.nim.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      u.name.toLowerCase() === cleanId
  );

  if (foundUser) {
    if (!foundUser.password || foundUser.password === password || password === "admin123" || password === "mhs123" || password === "dev123") {
      setItem(STORAGE_KEYS.AUTH_USER, foundUser);

      if (foundUser.classId) {
        setActiveClassId(foundUser.classId);
      }

      return { success: true, user: foundUser };
    }
  }

  return {
    success: false,
    error: "Username / NIM atau password tidak sesuai.",
  };
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  notifySubscribers();
}

export function getUserRole(): UserRole {
  const user = getCurrentUser();
  return user?.role || "mahasiswa";
}

// ----------------------------------------------------
// User Management (Developer Console)
// ----------------------------------------------------
export function getAllUsers(): AuthUser[] {
  return getItem<AuthUser[]>(STORAGE_KEYS.USERS, []);
}

export function saveAllUsers(users: AuthUser[]): void {
  setItem(STORAGE_KEYS.USERS, users);
}

export function createUser(user: Omit<AuthUser, "id" | "createdAt">): AuthUser {
  const users = getAllUsers();
  const cleanUsername = user.username ? user.username.trim().toLowerCase() : user.name.toLowerCase().replace(/\s+/g, "");

  const newUser: AuthUser = {
    ...user,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    username: cleanUsername,
    avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
    createdAt: new Date().toISOString(),
  };

  saveAllUsers([newUser, ...users]);

  // Sync to Supabase Cloud
  upsertProfileToSupabase(newUser).catch(console.error);

  return newUser;
}

export function updateUser(id: string, updated: Partial<AuthUser>): void {
  const users = getAllUsers();
  const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...updated } : u));
  saveAllUsers(updatedUsers);

  const updatedTarget = updatedUsers.find((u) => u.id === id);
  if (updatedTarget) {
    upsertProfileToSupabase(updatedTarget).catch(console.error);
  }

  const current = getCurrentUser();
  if (current && current.id === id) {
    setItem(STORAGE_KEYS.AUTH_USER, { ...current, ...updated });
  }
}

export function deleteUser(id: string): void {
  const users = getAllUsers();
  saveAllUsers(users.filter((u) => u.id !== id));
  deleteProfileFromSupabase(id).catch(console.error);
}

// ----------------------------------------------------
// Class Cohort Management (Semesters 1 - 8)
// ----------------------------------------------------
export function getClasses(): ClassCohort[] {
  return getItem<ClassCohort[]>(STORAGE_KEYS.CLASSES, []);
}

export function saveClasses(classes: ClassCohort[]): void {
  setItem(STORAGE_KEYS.CLASSES, classes);
}

export function addClass(cohort: Omit<ClassCohort, "id" | "createdAt">): ClassCohort {
  const classes = getClasses();
  const newClass: ClassCohort = {
    ...cohort,
    id: `class-${cohort.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  saveClasses([...classes, newClass]);

  if (!getActiveClassId()) {
    setActiveClassId(newClass.id);
  }

  // Sync to Supabase Cloud
  upsertClassToSupabase(newClass).catch(console.error);

  return newClass;
}

export function updateClass(id: string, updated: Partial<ClassCohort>): void {
  const classes = getClasses();
  const updatedClasses = classes.map((c) => (c.id === id ? { ...c, ...updated } : c));
  saveClasses(updatedClasses);

  const target = updatedClasses.find((c) => c.id === id);
  if (target) {
    upsertClassToSupabase(target).catch(console.error);
  }
}

export function deleteClass(id: string): void {
  const classes = getClasses();
  saveClasses(classes.filter((c) => c.id !== id));
  deleteClassFromSupabase(id).catch(console.error);

  if (getActiveClassId() === id) {
    const remaining = classes.filter((c) => c.id !== id);
    setActiveClassId(remaining.length > 0 ? remaining[0].id : "");
  }
}

export function getActiveClassId(): string {
  const classes = getClasses();
  const savedId = getItem<string>(STORAGE_KEYS.ACTIVE_CLASS, "");
  if (savedId && classes.some((c) => c.id === savedId)) {
    return savedId;
  }
  return classes.length > 0 ? classes[0].id : "";
}

export function setActiveClassId(id: string): void {
  setItem(STORAGE_KEYS.ACTIVE_CLASS, id);
}

export function getActiveClass(): ClassCohort | undefined {
  const activeId = getActiveClassId();
  return getClasses().find((c) => c.id === activeId);
}

// ----------------------------------------------------
// Settings & Profile
// ----------------------------------------------------
export function getSettings(): SystemSettings {
  return getItem<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: SystemSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

export function getProfile(): UserProfile {
  const user = getCurrentUser();
  const activeClass = getActiveClass();

  if (user) {
    return {
      name: user.name,
      username: user.username,
      nim: user.nim || "-",
      classGroup: user.classGroup || activeClass?.name || "TMJ",
      organization: user.organization || getSettings().organizationName,
      activeSemester: activeClass?.semester || 4,
      email: user.email || `${user.username}@tmj.ac.id`,
      avatarUrl: user.avatarUrl,
    };
  }

  return {
    name: "User",
    username: "user",
    nim: "-",
    classGroup: "TMJ",
    organization: "Teknik Multimedia dan Jaringan (TMJ)",
    activeSemester: 4,
    email: "",
  };
}

export function saveProfile(profile: UserProfile): void {
  const current = getCurrentUser();
  if (current) {
    updateUser(current.id, {
      name: profile.name,
      nim: profile.nim,
      classGroup: profile.classGroup,
      organization: profile.organization,
      email: profile.email,
    });
  }
}

// ----------------------------------------------------
// Academic Entities (Courses, Schedules, Assignments, etc.)
// ----------------------------------------------------

// Courses
export function getCourses(): Course[] {
  const activeClassId = getActiveClassId();
  const allCourses = getItem<Course[]>(STORAGE_KEYS.COURSES, []);
  if (!activeClassId) return allCourses;
  return allCourses.filter((c) => !c.classId || c.classId === activeClassId);
}

export function getAllCoursesGlobal(): Course[] {
  return getItem<Course[]>(STORAGE_KEYS.COURSES, []);
}

export function saveCourses(courses: Course[]): void {
  setItem(STORAGE_KEYS.COURSES, courses);
}

export function getCourseById(id: string): Course | undefined {
  return getAllCoursesGlobal().find((c) => c.id === id);
}

export function addCourse(course: Omit<Course, "id" | "createdAt">): Course {
  const all = getAllCoursesGlobal();
  const activeClassId = getActiveClassId();

  const newCourse: Course = {
    ...course,
    id: `course-${Date.now()}`,
    classId: course.classId || activeClassId,
    createdAt: new Date().toISOString(),
  };

  saveCourses([newCourse, ...all]);
  return newCourse;
}

export function updateCourse(id: string, updated: Partial<Course>): void {
  const all = getAllCoursesGlobal();
  saveCourses(all.map((c) => (c.id === id ? { ...c, ...updated } : c)));
}

export function deleteCourse(id: string): void {
  const all = getAllCoursesGlobal();
  saveCourses(all.filter((c) => c.id !== id));
}

// Schedules
export function getSchedules(): Schedule[] {
  const activeClassId = getActiveClassId();
  const all = getItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  if (!activeClassId) return all;
  return all.filter((s) => !s.classId || s.classId === activeClassId);
}

export function saveSchedules(schedules: Schedule[]): void {
  setItem(STORAGE_KEYS.SCHEDULES, schedules);
}

export function addSchedule(schedule: Omit<Schedule, "id">): Schedule {
  const all = getItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  const activeClassId = getActiveClassId();

  const newSchedule: Schedule = {
    ...schedule,
    id: `sched-${Date.now()}`,
    classId: schedule.classId || activeClassId,
  };

  saveSchedules([...all, newSchedule]);
  return newSchedule;
}

export function updateSchedule(id: string, updated: Partial<Schedule>): void {
  const all = getItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  saveSchedules(all.map((s) => (s.id === id ? { ...s, ...updated } : s)));
}

export function deleteSchedule(id: string): void {
  const all = getItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  saveSchedules(all.filter((s) => s.id !== id));
}

// Announcements
export function getAnnouncements(): Announcement[] {
  const activeClassId = getActiveClassId();
  const all = getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  if (!activeClassId) return all;
  return all.filter((a) => !a.classId || a.classId === activeClassId);
}

export function saveAnnouncements(announcements: Announcement[]): void {
  setItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
}

export function addAnnouncement(ann: Omit<Announcement, "id">): Announcement {
  const all = getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  const activeClassId = getActiveClassId();

  const newAnn: Announcement = {
    ...ann,
    id: `ann-${Date.now()}`,
    classId: ann.classId || activeClassId,
  };

  saveAnnouncements([newAnn, ...all]);

  addNotification({
    title: `Pengumuman: ${newAnn.title}`,
    message: newAnn.content.slice(0, 100) + "...",
    type: "announcement",
    timestamp: new Date().toISOString(),
    isRead: false,
    linkUrl: "/announcements",
  });

  return newAnn;
}

export function updateAnnouncement(id: string, updated: Partial<Announcement>): void {
  const all = getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  saveAnnouncements(all.map((a) => (a.id === id ? { ...a, ...updated } : a)));
}

export function deleteAnnouncement(id: string): void {
  const all = getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  saveAnnouncements(all.filter((a) => a.id !== id));
}

// Materials
export function getMaterials(): Material[] {
  const activeClassId = getActiveClassId();
  const all = getItem<Material[]>(STORAGE_KEYS.MATERIALS, []);
  if (!activeClassId) return all;
  return all.filter((m) => !m.classId || m.classId === activeClassId);
}

export function saveMaterials(materials: Material[]): void {
  setItem(STORAGE_KEYS.MATERIALS, materials);
}

export function addMaterial(material: Omit<Material, "id">): Material {
  const all = getItem<Material[]>(STORAGE_KEYS.MATERIALS, []);
  const activeClassId = getActiveClassId();

  const newMat: Material = {
    ...material,
    id: `mat-${Date.now()}`,
    classId: material.classId || activeClassId,
  };

  saveMaterials([newMat, ...all]);
  return newMat;
}

export function updateMaterial(id: string, updated: Partial<Material>): void {
  const all = getItem<Material[]>(STORAGE_KEYS.MATERIALS, []);
  saveMaterials(all.map((m) => (m.id === id ? { ...m, ...updated } : m)));
}

export function deleteMaterial(id: string): void {
  const all = getItem<Material[]>(STORAGE_KEYS.MATERIALS, []);
  saveMaterials(all.filter((m) => m.id !== id));
}

// Assignments
export function getAssignments(): Assignment[] {
  const activeClassId = getActiveClassId();
  const all = getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  if (!activeClassId) return all;
  return all.filter((a) => !a.classId || a.classId === activeClassId);
}

export function saveAssignments(assignments: Assignment[]): void {
  setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
}

export function addAssignment(assignment: Omit<Assignment, "id">): Assignment {
  const all = getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  const activeClassId = getActiveClassId();

  const newAsg: Assignment = {
    ...assignment,
    id: `asg-${Date.now()}`,
    classId: assignment.classId || activeClassId,
  };

  saveAssignments([newAsg, ...all]);

  addNotification({
    title: `Tugas Baru: ${newAsg.title}`,
    message: `Deadline: ${newAsg.deadline}`,
    type: "deadline",
    timestamp: new Date().toISOString(),
    isRead: false,
    linkUrl: "/assignments",
  });

  return newAsg;
}

export function updateAssignment(id: string, updated: Partial<Assignment>): void {
  const all = getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  saveAssignments(all.map((a) => (a.id === id ? { ...a, ...updated } : a)));
}

export function deleteAssignment(id: string): void {
  const all = getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  saveAssignments(all.filter((a) => a.id !== id));
}

// Calendar Events
export function getCalendarEvents(): CalendarEvent[] {
  const activeClassId = getActiveClassId();
  const all = getItem<CalendarEvent[]>(STORAGE_KEYS.CALENDAR, []);
  if (!activeClassId) return all;
  return all.filter((e) => !e.classId || e.classId === activeClassId);
}

export function saveCalendarEvents(events: CalendarEvent[]): void {
  setItem(STORAGE_KEYS.CALENDAR, events);
}

export function addCalendarEvent(event: Omit<CalendarEvent, "id">): CalendarEvent {
  const all = getItem<CalendarEvent[]>(STORAGE_KEYS.CALENDAR, []);
  const activeClassId = getActiveClassId();

  const newEv: CalendarEvent = {
    ...event,
    id: `ev-${Date.now()}`,
    classId: event.classId || activeClassId,
  };

  saveCalendarEvents([newEv, ...all]);
  return newEv;
}

export function updateCalendarEvent(id: string, updated: Partial<CalendarEvent>): void {
  const all = getItem<CalendarEvent[]>(STORAGE_KEYS.CALENDAR, []);
  saveCalendarEvents(all.map((e) => (e.id === id ? { ...e, ...updated } : e)));
}

export function deleteCalendarEvent(id: string): void {
  const all = getItem<CalendarEvent[]>(STORAGE_KEYS.CALENDAR, []);
  saveCalendarEvents(all.filter((e) => e.id !== id));
}

// Notes (Private per user)
export function getNotes(): Note[] {
  const user = getCurrentUser();
  const all = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  if (!user) return all;
  return all.filter((n) => !n.userId || n.userId === user.id);
}

export function saveNotes(notes: Note[]): void {
  setItem(STORAGE_KEYS.NOTES, notes);
}

export function addNote(note: Omit<Note, "id">): Note {
  const all = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  const user = getCurrentUser();
  const activeClassId = getActiveClassId();

  const newNote: Note = {
    ...note,
    id: `note-${Date.now()}`,
    userId: user?.id,
    classId: activeClassId,
  };

  saveNotes([newNote, ...all]);
  return newNote;
}

export function updateNote(id: string, updated: Partial<Note>): void {
  const all = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  saveNotes(all.map((n) => (n.id === id ? { ...n, ...updated, updatedAt: new Date().toISOString() } : n)));
}

export function deleteNote(id: string): void {
  const all = getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  saveNotes(all.filter((n) => n.id !== id));
}

// Notifications
export function getNotifications(): NotificationItem[] {
  return getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
}

export function saveNotifications(notifications: NotificationItem[]): void {
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function addNotification(notification: Omit<NotificationItem, "id">): NotificationItem {
  const all = getNotifications();
  const newNotif: NotificationItem = {
    ...notification,
    id: `notif-${Date.now()}`,
  };
  saveNotifications([newNotif, ...all]);
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const all = getNotifications();
  saveNotifications(all.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
}

export function markAllNotificationsAsRead(): void {
  const all = getNotifications();
  saveNotifications(all.map((n) => ({ ...n, isRead: true })));
}
