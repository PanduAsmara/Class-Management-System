"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  Video,
  ExternalLink,
  Edit2,
  Trash2,
  List,
  Grid,
  Calendar as CalendarIcon,
  Building2
} from "lucide-react";
import {
  getSchedules,
  getCourses,
  deleteSchedule,
  getUserRole,
  getActiveClass,
  subscribeToStore
} from "@/lib/storage";
import { Schedule, Course, DayOfWeek, UserRole, ClassCohort } from "@/types";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { ScheduleModal } from "@/components/schedule/ScheduleModal";

const DAYS_ORDER: DayOfWeek[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"weekly" | "daily" | "list">("weekly");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Senin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    setSchedules(getSchedules());
    setCourses(getCourses());
    setRole(getUserRole());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setSchedules(getSchedules());
      setCourses(getCourses());
      setRole(getUserRole());
      setActiveClass(getActiveClass());
    });
    return () => unsubscribe();
  }, []);

  const canManage = role === "developer" || role === "admin" || role === "ketua_kelas";
  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);

  const handleEdit = (s: Schedule) => {
    setEditingSchedule(s);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus jadwal ini?")) {
      deleteSchedule(id);
    }
  };

  const handleAddNew = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Jadwal Kuliah {activeClass ? `• ${activeClass.name}` : ""}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Matriks Waktu & Ruangan Perkuliahan {activeClass ? `${activeClass.name} (Semester ${activeClass.semester})` : "Kelas"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <BrutalButton
              onClick={handleAddNew}
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Jadwal
            </BrutalButton>
          )}
        </div>
      </div>

      {/* View Switcher Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setViewMode("weekly")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-heading font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
              viewMode === "weekly"
                ? "bg-white text-slate-900 shadow-soft-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Weekly View
          </button>
          <button
            onClick={() => setViewMode("daily")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-heading font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
              viewMode === "daily"
                ? "bg-white text-slate-900 shadow-soft-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Daily View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-heading font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-soft-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5" /> List View
          </button>
        </div>

        {/* Day Filter (if Daily View) */}
        {viewMode === "daily" && (
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {DAYS_ORDER.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1 text-xs rounded-xl font-medium transition-all select-none ${
                  selectedDay === d
                    ? "bg-blue-600 text-white font-semibold shadow-soft-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State Banner if 0 Schedules */}
      {schedules.length === 0 && (
        <div className="p-12 border border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-soft-xs">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Belum ada jadwal kuliah untuk {activeClass?.name || "kelas ini"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {canManage
                ? "Tambahkan jadwal sesi perkuliahan mingguan, ruangan lab/kelas, jam, dan link Google Meet."
                : "Jadwal kuliah belum dimasukkan oleh ketua kelas / pengurus."}
            </p>
          </div>
          {canManage && (
            <BrutalButton onClick={handleAddNew} variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Tambah Sesi Jadwal Pertama
            </BrutalButton>
          )}
        </div>
      )}

      {/* 1. WEEKLY GRID VIEW */}
      {viewMode === "weekly" && schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS_ORDER.map((day) => {
            const daySchedules = schedules
              .filter((s) => s.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col min-h-[320px] overflow-hidden"
              >
                {/* Day Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-heading font-semibold text-xs text-slate-800 uppercase flex items-center justify-between">
                  <span>{day}</span>
                  <span className="text-[11px] font-sans font-normal text-slate-400">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                {/* Day Slots */}
                <div className="p-3 flex-1 space-y-2.5 bg-slate-50/30">
                  {daySchedules.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-center text-xs text-slate-400">
                      Tidak ada kelas
                    </div>
                  ) : (
                    daySchedules.map((s) => {
                      const course = getCourse(s.courseId);
                      return (
                        <div
                          key={s.id}
                          className="p-3 bg-white border border-slate-200/70 rounded-xl shadow-soft-xs hover:shadow-soft-sm transition-all space-y-1.5 relative overflow-hidden"
                        >
                          <div
                            className="w-1 absolute left-0 top-0 bottom-0"
                            style={{ backgroundColor: course?.color || "#2563EB" }}
                          />

                          <div className="flex items-center justify-between pl-1">
                            <span className="text-[10px] font-mono font-medium text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              {s.startTime} - {s.endTime}
                            </span>
                            {s.type && (
                              <BrutalBadge variant="warning" size="sm">
                                {s.type}
                              </BrutalBadge>
                            )}
                          </div>

                          <Link href={`/courses/${s.courseId}`}>
                            <h4 className="font-heading font-semibold text-xs text-slate-900 hover:text-blue-600 line-clamp-2 leading-tight pl-1">
                              {course?.name || "Mata Kuliah"}
                            </h4>
                          </Link>

                          <div className="text-[11px] text-slate-500 space-y-0.5 pl-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{s.room}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{s.lecturer}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between pl-1">
                            {s.meetingLink ? (
                              <a
                                href={s.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Video className="w-3 h-3" /> Meet
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400">Offline</span>
                            )}

                            {canManage && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEdit(s)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(s.id)}
                                  className="p-1 hover:bg-rose-50 rounded text-rose-500"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. DAILY TIMELINE VIEW */}
      {viewMode === "daily" && schedules.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-6">
          <h3 className="font-heading font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Jadwal Perkuliahan: {selectedDay}
          </h3>

          {schedules.filter((s) => s.day === selectedDay).length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada jadwal kuliah yang dijadwalkan pada hari {selectedDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules
                .filter((s) => s.day === selectedDay)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((s) => {
                  const course = getCourse(s.courseId);
                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                            {s.startTime} - {s.endTime} WIB
                          </span>
                          <span className="text-xs font-mono font-medium px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                            {course?.code}
                          </span>
                          {s.type && <BrutalBadge variant="warning">{s.type}</BrutalBadge>}
                        </div>

                        <Link href={`/courses/${s.courseId}`}>
                          <h4 className="font-heading font-bold text-base text-slate-900 hover:text-blue-600">
                            {course?.name}
                          </h4>
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" /> {s.lecturer}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {s.meetingLink && (
                          <a
                            href={s.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-soft-xs"
                          >
                            <Video className="w-3.5 h-3.5" /> Masuk Kelas Online
                          </a>
                        )}

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 rounded-xl"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 3. LIST TABLE VIEW */}
      {viewMode === "list" && schedules.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
          <table className="minimal-table">
            <thead>
              <tr>
                <th>Hari</th>
                <th>Waktu</th>
                <th>Kode</th>
                <th>Mata Kuliah</th>
                <th>Jenis</th>
                <th>Ruangan</th>
                <th>Dosen</th>
                <th>Tautan Online</th>
                {canManage && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {schedules
                .sort((a, b) => {
                  const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
                  if (dayDiff !== 0) return dayDiff;
                  return a.startTime.localeCompare(b.startTime);
                })
                .map((s) => {
                  const course = getCourse(s.courseId);
                  return (
                    <tr key={s.id}>
                      <td className="font-semibold text-blue-700">{s.day}</td>
                      <td className="font-mono text-xs text-slate-600">{s.startTime} - {s.endTime}</td>
                      <td className="font-mono text-xs font-medium text-slate-700">{course?.code || "TMJ"}</td>
                      <td className="font-medium text-sm text-slate-900">
                        <Link href={`/courses/${s.courseId}`} className="hover:text-blue-600 transition-colors">
                          {course?.name || "Mata Kuliah"}
                        </Link>
                      </td>
                      <td>{s.type ? <BrutalBadge variant="warning" size="sm">{s.type}</BrutalBadge> : "-"}</td>
                      <td className="text-xs text-slate-600">{s.room}</td>
                      <td className="text-xs text-slate-600">{s.lecturer}</td>
                      <td>
                        {s.meetingLink ? (
                          <a
                            href={s.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            <Video className="w-3.5 h-3.5" /> G-Meet
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">Offline</span>
                        )}
                      </td>
                      {canManage && (
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-1 hover:bg-rose-50 rounded text-rose-500"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        initialSchedule={editingSchedule}
      />
    </div>
  );
}
