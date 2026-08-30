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
  NotificationItem
} from "@/types";

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
// REAL-TIME CLOUD CRUD HELPERS
// ====================================================================

// CLASSES
export async function fetchClassesFromSupabase(): Promise<ClassCohort[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
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
}

export async function insertClassToSupabase(cls: ClassCohort): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { error } = await supabase.from("classes").insert({
    id: cls.id,
    name: cls.name,
    semester: cls.semester,
    academic_year: cls.academicYear,
    major: cls.major,
    description: cls.description,
    leader_id: cls.leaderId,
  });
  return !error;
}

// COURSES
export async function fetchCoursesFromSupabase(classId?: string): Promise<Course[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  let query = supabase.from("courses").select("*");
  if (classId) {
    query = query.eq("class_id", classId);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((d: any) => ({
    id: d.id,
    classId: d.class_id,
    name: d.name,
    code: d.code,
    semester: d.semester,
    sks: d.sks,
    lecturer: d.lecturer,
    lecturerNip: d.lecturer_nip,
    lecturerContact: d.lecturer_contact,
    color: d.color,
    room: d.room,
    description: d.description,
    syllabus: d.syllabus,
    createdAt: d.created_at,
  }));
}

export async function insertCourseToSupabase(course: Course): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { error } = await supabase.from("courses").insert({
    id: course.id,
    class_id: course.classId,
    name: course.name,
    code: course.code,
    semester: course.semester,
    sks: course.sks,
    lecturer: course.lecturer,
    lecturer_nip: course.lecturerNip,
    lecturer_contact: course.lecturerContact,
    color: course.color,
    room: course.room,
    description: course.description,
    syllabus: course.syllabus || [],
  });
  return !error;
}

// Check live connection health
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tableCount: number;
  message: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      connected: false,
      tableCount: 0,
      message: "Kredensial NEXT_PUBLIC_SUPABASE_URL belum dimasukkan di .env.local",
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
