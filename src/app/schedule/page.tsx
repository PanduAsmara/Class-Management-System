"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MessageSquare
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
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { ScheduleModal } from "@/components/schedule/ScheduleModal";
import { WhatsAppBroadcastModal } from "@/components/whatsapp/WhatsAppBroadcastModal";
import { formatDailyScheduleMessage } from "@/lib/whatsapp-service";

const DAYS: DayOfWeek[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [activeDay, setActiveDay] = useState<DayOfWeek>("Senin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // WhatsApp Broadcast Modal State
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waMessage, setWaMessage] = useState("");

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
  const daySchedules = schedules.filter((s) => s.day === activeDay);

  const getCourse = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus jadwal ${name}?`)) {
      deleteSchedule(id);
    }
  };

  const handleAddNew = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleOpenWaBroadcast = () => {
    const formatted = formatDailyScheduleMessage(
      activeClass,
      daySchedules,
      courses,
      activeDay
    );
    setWaMessage(formatted);
    setIsWaModalOpen(true);
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
            Jadwal Perkuliahan Mingguan & Ruang Kelas {activeClass ? activeClass.name : "Kelas"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Broadcast Button */}
          <BrutalButton
            onClick={handleOpenWaBroadcast}
            variant="success"
            size="md"
            icon={<MessageSquare className="w-4 h-4" />}
          >
            Broadcast ke WA
          </BrutalButton>

          {canManage && (
            <BrutalButton
              onClick={handleAddNew}
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Sesi
            </BrutalButton>
          )}
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
        {DAYS.map((day) => {
          const count = schedules.filter((s) => s.day === day).length;
          const isActive = activeDay === day;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-heading font-medium transition-all duration-150 flex items-center gap-2 whitespace-nowrap select-none ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-soft-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Items List */}
      {daySchedules.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-soft-xs">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Tidak ada perkuliahan di hari {activeDay}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {canManage
                ? "Jadwal kosong. Anda dapat menambahkan sesi mata kuliah baru untuk kelas ini."
                : "Waktunya istirahat atau mengerjakan tugas mandiri."}
            </p>
          </div>
          {canManage && (
            <BrutalButton onClick={handleAddNew} variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Tambah Jadwal Hari {activeDay}
            </BrutalButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daySchedules
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((sch) => {
              const course = getCourse(sch.courseId);

              return (
                <div
                  key={sch.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                          {sch.startTime} - {sch.endTime}
                        </span>
                        {sch.type && (
                          <BrutalBadge variant="neutral" size="sm">
                            {sch.type}
                          </BrutalBadge>
                        )}
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(sch)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
                            title="Edit Jadwal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id, course?.name || "Jadwal")}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-mono text-slate-400 font-medium">
                        {course?.code || "TMJ"} • {course?.sks || 3} SKS
                      </div>
                      <h3 className="font-heading font-semibold text-base text-slate-900 mt-0.5">
                        {course?.name || "Mata Kuliah"}
                      </h3>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{sch.lecturer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sch.room}</span>
                      </div>
                    </div>
                  </div>

                  {sch.meetingLink && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={sch.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>Join Online Class</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Schedule Edit/Add Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        initialSchedule={editingSchedule}
        defaultDay={activeDay}
      />

      {/* WhatsApp Broadcast Modal */}
      <WhatsAppBroadcastModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        title={`Broadcast Jadwal Kuliah (${activeDay})`}
        defaultMessage={waMessage}
      />
    </div>
  );
}
