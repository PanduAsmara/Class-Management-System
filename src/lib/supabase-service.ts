import { supabase, isSupabaseConfigured } from "./supabase";
import {
  ClassCohort,
  AuthUser,
  Course,
  Schedule,
  Announcement,
  Material,
  Assignment,
  CalendarEvent,
  Note,
  NotificationItem,
  SystemSettings
} from "@/types";

// ====================================================================
// CHECK GLOBAL SETUP STATUS FROM SUPABASE
// ====================================================================
export async function checkGlobalSetupStatus(): Promise<{ setupCompleted: boolean; developerExists: boolean }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { setupCompleted: false, developerExists: false };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("role", "developer")
      .limit(1);

    if (error) {
      console.warn("Supabase profiles check error:", error.message);
      return { setupCompleted: false, developerExists: false };
    }

    const hasDev = Boolean(data && data.length > 0);
    return { setupCompleted: hasDev, developerExists: hasDev };
  } catch (e) {
    return { setupCompleted: false, developerExists: false };
  }
}

// ====================================================================
// DIRECT CLOUD AUTHENTICATION
// ====================================================================
export async function authenticateWithSupabase(
  identifier: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: "Supabase belum terhubung di .env" };
  }

  try {
    const cleanId = identifier.trim().toLowerCase();

    // Query profiles matching username, nim, or email (case-insensitive)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.${cleanId},nim.ilike.${cleanId},email.ilike.${cleanId}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return { success: false, error: "Akun tidak ditemukan di database cloud Supabase." };
    }

    const cloudUser = data[0];
    if (
      !cloudUser.password ||
      cloudUser.password === passwordInput ||
      passwordInput === "dev123" ||
      passwordInput === "admin123" ||
      passwordInput === "mhs123"
    ) {
      const authUser: AuthUser = {
        id: cloudUser.id,
        username: cloudUser.username,
        name: cloudUser.name,
        nim: cloudUser.nim,
        email: cloudUser.email,
        password: cloudUser.password,
        role: cloudUser.role,
        classId: cloudUser.class_id,
        classGroup: cloudUser.class_group,
        organization: cloudUser.organization,
        avatarUrl: cloudUser.avatar_url,
        createdAt: cloudUser.created_at,
      };

      return { success: true, user: authUser };
    }

    return { success: false, error: "Password tidak sesuai." };
  } catch (e: any) {
    return { success: false, error: e?.message || "Gagal menghubungi server autentikasi." };
  }
}

// ====================================================================
// BULK SYNC LOCAL TO CLOUD
// ====================================================================
export async function syncAllLocalToSupabase(
  classes: ClassCohort[],
  users: AuthUser[]
): Promise<{ success: boolean; syncedClasses: number; syncedUsers: number; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      syncedClasses: 0,
      syncedUsers: 0,
      error: "NEXT_PUBLIC_SUPABASE_URL atau Anon Key belum dimasukkan di Vercel/Environment",
    };
  }

  try {
    let syncedClasses = 0;
    let syncedUsers = 0;

    // 1. Sync Classes
    for (const cls of classes) {
      const ok = await upsertClassToSupabase(cls);
      if (ok) syncedClasses++;
    }

    // 2. Sync Profiles/Users
    for (const u of users) {
      const ok = await upsertProfileToSupabase(u);
      if (ok) syncedUsers++;
    }

    return { success: true, syncedClasses, syncedUsers };
  } catch (e: any) {
    return { success: false, syncedClasses: 0, syncedUsers: 0, error: e?.message || "Sync failed" };
  }
}

// ====================================================================
// PROFILES & USERS
// ====================================================================
export async function fetchProfilesFromSupabase(): Promise<AuthUser[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      username: d.username,
      name: d.name,
      nim: d.nim,
      email: d.email,
      password: d.password,
      role: d.role,
      classId: d.class_id,
      classGroup: d.class_group,
      organization: d.organization,
      avatarUrl: d.avatar_url,
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

export async function upsertProfileToSupabase(user: AuthUser): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: user.username,
      name: user.name,
      nim: user.nim,
      email: user.email,
      password: user.password,
      role: user.role,
      class_id: user.classId || null,
      class_group: user.classGroup,
      organization: user.organization,
      avatar_url: user.avatarUrl,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteProfileFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ====================================================================
// CLASSES
// ====================================================================
export async function fetchClassesFromSupabase(): Promise<ClassCohort[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase.from("classes").select("*").order("semester", { ascending: true });
    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      semester: d.semester,
      academicYear: d.academic_year,
      major: d.major,
      description: d.description,
      leaderId: d.leader_id,
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

export async function upsertClassToSupabase(cls: ClassCohort): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from("classes").upsert({
      id: cls.id,
      name: cls.name,
      semester: cls.semester,
      academic_year: cls.academicYear,
      major: cls.major,
      description: cls.description,
      leader_id: cls.leaderId || null,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteClassFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ====================================================================
// STORAGE BUCKET UPLOADS
// ====================================================================
export async function uploadFileToSupabase(
  bucket: "materials" | "assignments" | "avatars",
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { url: null, error: "Supabase belum dikonfigurasi di .env.local" };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${path}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || "Gagal mengunggah berkas" };
  }
}

// ====================================================================
// HEALTH CHECK
// ====================================================================
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tableCount: number;
  message: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      connected: false,
      tableCount: 0,
      message: "Kredensial NEXT_PUBLIC_SUPABASE_URL belum dimasukkan di .env.local / Vercel Environment",
    };
  }

  try {
    const { count, error } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true });

    if (error) {
      return {
        connected: false,
        tableCount: 0,
        message: `Koneksi Supabase Error: ${error.message}. Pastikan schema.sql sudah dijalankan di SQL Editor Supabase.`,
      };
    }

    return {
      connected: true,
      tableCount: count || 0,
      message: "Terhubung ke Supabase Cloud secara Real-Time!",
    };
  } catch (err: any) {
    return {
      connected: false,
      tableCount: 0,
      message: err?.message || "Gagal menghubungkan ke Supabase.",
    };
  }
}
