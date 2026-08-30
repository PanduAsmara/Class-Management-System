"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  CalendarDays,
  Megaphone,
  FolderDown,
  CheckSquare,
  FileText,
  User,
  MapPin,
  Mail,
  Clock,
  Plus,
  Video,
  Download,
  ExternalLink,
  Edit2
} from "lucide-react";
import {
  getCourseById,
  getAnnouncements,
  getMaterials,
  getAssignments,
  getSchedules,
  getNotes,
  getUserRole,
  subscribeToStore,
  updateAssignment
} from "@/lib/storage";
import {
  Course,
  Announcement,
  Material,
  Assignment,
  Schedule,
  Note,
  UserRole
} from "@/types";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalTabs } from "@/components/ui/BrutalTabs";
import { formatShortDate, getRelativeDays } from "@/lib/utils";
import { CourseModal } from "@/components/courses/CourseModal";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [role, setRole] = useState<UserRole>("admin");
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const currentCourse = getCourseById(courseId);
    setCourse(currentCourse);
    setAnnouncements(getAnnouncements().filter((a) => a.targetCourseId === courseId));
    setMaterials(getMaterials().filter((m) => m.courseId === courseId));
    setAssignments(getAssignments().filter((a) => a.courseId === courseId));
    setSchedules(getSchedules().filter((s) => s.courseId === courseId));
    setNotes(getNotes().filter((n) => n.courseId === courseId));
    setRole(getUserRole());

    const unsubscribe = subscribeToStore(() => {
      setCourse(getCourseById(courseId));
      setAnnouncements(getAnnouncements().filter((a) => a.targetCourseId === courseId));
      setMaterials(getMaterials().filter((m) => m.courseId === courseId));
      setAssignments(getAssignments().filter((a) => a.courseId === courseId));
      setSchedules(getSchedules().filter((s) => s.courseId === courseId));
      setNotes(getNotes().filter((n) => n.courseId === courseId));
      setRole(getUserRole());
    });
    return () => unsubscribe();
  }, [courseId]);

  if (!course) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-card">
        <h2 className="font-heading font-bold text-xl text-slate-800">
          Mata Kuliah Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Mata kuliah mungkin telah dihapus.
        </p>
        <Link href="/courses" className="inline-block mt-4">
          <BrutalButton variant="primary" size="sm">Kembali ke Daftar Matkul</BrutalButton>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "announcement", label: "Announcement", count: announcements.length, icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: "materi", label: "Materi", count: materials.length, icon: <FolderDown className="w-3.5 h-3.5" /> },
    { id: "tugas", label: "Tugas", count: assignments.length, icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: "jadwal", label: "Jadwal", count: schedules.length, icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { id: "catatan", label: "Catatan", count: notes.length, icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const toggleTaskDone = (asg: Assignment) => {
    const nextStatus = asg.status === "selesai" ? "progress" : "selesai";
    updateAssignment(asg.id, {
      status: nextStatus,
      isCompletedByStudent: nextStatus === "selesai",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Semua Mata Kuliah
        </Link>
      </div>

      {/* Course Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-6 relative overflow-hidden">
        <div
          className="h-1.5 absolute top-0 left-0 right-0"
          style={{ backgroundColor: course.color || "#2563EB" }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {course.code}
              </span>
              <BrutalBadge variant="primary">{course.sks} SKS</BrutalBadge>
              <BrutalBadge variant="neutral">Semester {course.semester}</BrutalBadge>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {course.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <User className="w-4 h-4 text-blue-600" /> {course.lecturer}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400" /> {course.room || "Ruang Kelas TMJ"}
              </span>
              {course.lecturerContact && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" /> {course.lecturerContact}
                </span>
              )}
            </div>
          </div>

          {role === "admin" && (
            <div className="flex items-center gap-2">
              <BrutalButton
                onClick={() => setIsEditModalOpen(true)}
                variant="neutral"
                size="sm"
                icon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Matkul
              </BrutalButton>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <BrutalTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Contents */}
      <div className="mt-4">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <BrutalCard header="Deskripsi Mata Kuliah">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {course.description || "Belum ada deskripsi untuk mata kuliah ini."}
                </p>
              </BrutalCard>

              {/* Syllabus Card */}
              <BrutalCard
                header="Silabus & Pokok Bahasan Perkuliahan"
                badge={
                  <span className="text-xs font-mono font-medium text-blue-600">
                    {course.syllabus ? course.syllabus.length : 0} Topik
                  </span>
                }
              >
                {course.syllabus && course.syllabus.length > 0 ? (
                  <ol className="space-y-2">
                    {course.syllabus.map((topic, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="w-5 h-5 bg-blue-100 text-blue-700 font-mono font-bold text-xs rounded-md flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          {topic}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-slate-400">
                    Silabus belum diisi oleh dosen pengampu.
                  </p>
                )}
              </BrutalCard>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <BrutalCard header="Informasi Dosen">
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-slate-400 uppercase font-medium text-[10px]">Nama Lengkap</div>
                    <div className="font-semibold text-slate-800 text-sm mt-0.5">{course.lecturer}</div>
                  </div>
                  {course.lecturerNip && (
                    <div>
                      <div className="text-slate-400 uppercase font-medium text-[10px]">NIP / NIDN</div>
                      <div className="text-slate-600 mt-0.5">{course.lecturerNip}</div>
                    </div>
                  )}
                  {course.lecturerContact && (
                    <div>
                      <div className="text-slate-400 uppercase font-medium text-[10px]">Kontak & Email</div>
                      <div className="text-slate-600 break-all mt-0.5">{course.lecturerContact}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-slate-400 uppercase font-medium text-[10px]">Ruang Kuliah / Lab</div>
                    <div className="text-slate-600 mt-0.5">{course.room}</div>
                  </div>
                </div>
              </BrutalCard>

              <BrutalCard header="Ringkasan Beban Studi">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-heading font-bold text-2xl text-blue-600">{course.sks}</div>
                    <div className="text-[11px] text-slate-400">SKS</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-heading font-bold text-2xl text-emerald-600">{schedules.length}</div>
                    <div className="text-[11px] text-slate-400">Sesi/Minggu</div>
                  </div>
                </div>
              </BrutalCard>
            </div>
          </div>
        )}

        {/* 2. ANNOUNCEMENT TAB */}
        {activeTab === "announcement" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Pengumuman Khusus {course.name}
              </h3>
              <Link href="/announcements">
                <BrutalButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                  Buka Pengumuman
                </BrutalButton>
              </Link>
            </div>

            {announcements.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-center text-xs text-slate-400">
                Belum ada pengumuman khusus untuk mata kuliah ini.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-card space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <BrutalBadge variant="primary" size="sm">
                        {ann.category}
                      </BrutalBadge>
                      <span className="text-xs text-slate-400">
                        {formatShortDate(ann.date)}
                      </span>
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-slate-900">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MATERI TAB */}
        {activeTab === "materi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Materi Perkuliahan (Minggu 1 - 16)
              </h3>
              <Link href="/materials">
                <BrutalButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                  Kelola Materi
                </BrutalButton>
              </Link>
            </div>

            {materials.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-center text-xs text-slate-400">
                Belum ada berkas materi yang diunggah untuk mata kuliah ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-mono text-xs font-semibold">
                          Minggu {mat.week}
                        </span>
                        <BrutalBadge variant="neutral" size="sm">
                          {mat.attachmentType.toUpperCase()}
                        </BrutalBadge>
                      </div>
                      <h4 className="font-heading font-semibold text-sm text-slate-900 mb-1">
                        {mat.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {mat.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {mat.fileSize || "File"}
                      </span>
                      <a
                        href={mat.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors shadow-soft-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> Buka Materi
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. TUGAS TAB */}
        {activeTab === "tugas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Tugas & Praktikum {course.name}
              </h3>
              <Link href="/assignments">
                <BrutalButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                  Buka Menu Tugas
                </BrutalButton>
              </Link>
            </div>

            {assignments.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-center text-xs text-slate-400">
                Tidak ada tugas aktif untuk mata kuliah ini.
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={asg.status === "selesai"}
                          onChange={() => toggleTaskDone(asg)}
                          className="minimal-check mt-0.5"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <BrutalBadge
                              variant={
                                asg.priority === "high"
                                  ? "danger"
                                  : asg.priority === "medium"
                                  ? "warning"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              {asg.priority}
                            </BrutalBadge>
                            <span className="text-xs text-rose-600 font-medium">
                              {getRelativeDays(asg.deadline)}
                            </span>
                          </div>
                          <h4 className="font-heading font-semibold text-sm sm:text-base text-slate-900">
                            {asg.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            {asg.description}
                          </p>
                        </div>
                      </div>

                      {asg.submissionLink && (
                        <a
                          href={asg.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0"
                        >
                          Submit
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. JADWAL TAB */}
        {activeTab === "jadwal" && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-800">
              Jadwal Sesi Perkuliahan
            </h3>

            {schedules.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-center text-xs text-slate-400">
                Belum ada jadwal sesi yang didaftarkan untuk mata kuliah ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-base text-blue-700">
                        {s.day}
                      </span>
                      {s.type && <BrutalBadge variant="warning">{s.type}</BrutalBadge>}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <Clock className="w-4 h-4 text-blue-600" /> {s.startTime} - {s.endTime} WIB
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> {s.room}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" /> {s.lecturer}
                      </div>
                    </div>

                    {s.meetingLink && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 w-full justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" /> Gabung Google Meet
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. CATATAN TAB */}
        {activeTab === "catatan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Catatan Pribadi {course.name}
              </h3>
              <Link href="/notes">
                <BrutalButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                  Buka Editor Catatan
                </BrutalButton>
              </Link>
            </div>

            {notes.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-center text-xs text-slate-400">
                Belum ada catatan untuk mata kuliah ini.
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-card space-y-1.5"
                  >
                    <h4 className="font-heading font-semibold text-sm text-slate-900">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-wrap">
                      {n.content}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      {n.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Course Modal */}
      <CourseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialCourse={course}
      />
    </div>
  );
}
