-- ====================================================================
-- TMJ CLASS MANAGEMENT SYSTEM - SUPABASE SQL SCHEMA
-- Multi-Class SaaS (Semester 1 s.d. 8)
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. CREATE TABLES
-- ====================================================================

-- TABLE: CLASSES (Cohorts / Rombel Semester 1 - 8)
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    academic_year TEXT NOT NULL DEFAULT '2025/2026 Genap',
    major TEXT NOT NULL DEFAULT 'Teknik Multimedia dan Jaringan',
    description TEXT,
    leader_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: PROFILES / USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    nim TEXT,
    email TEXT,
    password TEXT NOT NULL DEFAULT 'mhs123',
    role TEXT NOT NULL CHECK (role IN ('developer', 'admin', 'ketua_kelas', 'mahasiswa')),
    class_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
    class_group TEXT,
    organization TEXT DEFAULT 'Teknik Multimedia dan Jaringan (TMJ)',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: COURSES (Mata Kuliah)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    sks INT NOT NULL DEFAULT 3,
    lecturer TEXT NOT NULL,
    lecturer_nip TEXT,
    lecturer_contact TEXT,
    color TEXT DEFAULT '#2563EB',
    room TEXT DEFAULT 'Ruang Kelas TMJ',
    description TEXT,
    syllabus JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: SCHEDULES (Jadwal Kuliah)
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    day TEXT NOT NULL CHECK (day IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
    start_time TEXT NOT NULL, -- e.g. "08:00"
    end_time TEXT NOT NULL,   -- e.g. "10:30"
    room TEXT NOT NULL,
    lecturer TEXT NOT NULL,
    meeting_link TEXT,
    type TEXT DEFAULT 'Teori',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: ANNOUNCEMENTS (Pengumuman)
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('info', 'reminder', 'important', 'urgent')),
    date TEXT NOT NULL,
    target_course_id TEXT,
    attachments JSONB DEFAULT '[]'::JSONB,
    author TEXT NOT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: MATERIALS (Materi & Modul Kuliah)
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    week INT NOT NULL CHECK (week >= 1 AND week <= 16),
    attachment_url TEXT NOT NULL,
    attachment_type TEXT NOT NULL CHECK (attachment_type IN ('pdf', 'ppt', 'docx', 'zip', 'gdrive', 'youtube')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_size TEXT
);

-- TABLE: ASSIGNMENTS (Tugas & Praktikum)
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'belum_mulai' CHECK (status IN ('belum_mulai', 'progress', 'selesai', 'terlambat')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    checklist JSONB DEFAULT '[]'::JSONB,
    submission_link TEXT,
    is_completed_by_student BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: CALENDAR_EVENTS (Kalender Akademik)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('kuliah', 'uts', 'uas', 'deadline', 'seminar', 'libur')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    time TEXT,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: NOTES (Catatan Belajar Pribadi)
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: NOTIFICATIONS (Notifikasi)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_class_id ON public.profiles(class_id);
CREATE INDEX IF NOT EXISTS idx_courses_class_id ON public.courses(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class_id ON public.schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_materials_class_id ON public.materials(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for anon key in custom app auth layer
CREATE POLICY "Allow public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow public all classes" ON public.classes FOR ALL USING (true);

CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public all courses" ON public.courses FOR ALL USING (true);

CREATE POLICY "Allow public read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Allow public all schedules" ON public.schedules FOR ALL USING (true);

CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public all announcements" ON public.announcements FOR ALL USING (true);

CREATE POLICY "Allow public read materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Allow public all materials" ON public.materials FOR ALL USING (true);

CREATE POLICY "Allow public read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow public all assignments" ON public.assignments FOR ALL USING (true);

CREATE POLICY "Allow public read calendar_events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Allow public all calendar_events" ON public.calendar_events FOR ALL USING (true);

CREATE POLICY "Allow public read notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Allow public all notes" ON public.notes FOR ALL USING (true);

CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public all notifications" ON public.notifications FOR ALL USING (true);

-- ====================================================================
-- 5. STORAGE BUCKETS (Materials, Assignments, Avatars)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('materials', 'materials', true),
    ('assignments', 'assignments', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Public Read Access Policies
CREATE POLICY "Public read materials bucket" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "Public upload materials bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Public read assignments bucket" ON storage.objects FOR SELECT USING (bucket_id = 'assignments');
CREATE POLICY "Public upload assignments bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assignments');

CREATE POLICY "Public read avatars bucket" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public upload avatars bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
