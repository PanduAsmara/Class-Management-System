"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  CalendarDays
} from "lucide-react";
import {
  getCalendarEvents,
  getCourses,
  deleteCalendarEvent,
  getUserRole,
  getActiveClass,
  subscribeToStore
} from "@/lib/storage";
import { CalendarEvent, CalendarEventType, Course, UserRole, ClassCohort } from "@/types";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { EventModal } from "@/components/calendar/EventModal";
import { formatDateIndo } from "@/lib/utils";

const EVENT_TYPE_COLORS: Record<CalendarEventType, { bg: string; text: string; dot: string; label: string }> = {
  kuliah: { bg: "bg-blue-50 text-blue-700 border-blue-100", text: "text-blue-700", dot: "bg-blue-600", label: "Kuliah" },
  uts: { bg: "bg-amber-50 text-amber-700 border-amber-100", text: "text-amber-700", dot: "bg-amber-600", label: "UTS" },
  uas: { bg: "bg-rose-50 text-rose-700 border-rose-100", text: "text-rose-700", dot: "bg-rose-600", label: "UAS" },
  deadline: { bg: "bg-orange-50 text-orange-700 border-orange-100", text: "text-orange-700", dot: "bg-orange-600", label: "Deadline" },
  seminar: { bg: "bg-purple-50 text-purple-700 border-purple-100", text: "text-purple-700", dot: "bg-purple-600", label: "Seminar" },
  libur: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-600", label: "Libur" },
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 30)); // Aug 30, 2026
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    setEvents(getCalendarEvents());
    setCourses(getCourses());
    setRole(getUserRole());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setEvents(getCalendarEvents());
      setCourses(getCourses());
      setRole(getUserRole());
      setActiveClass(getActiveClass());
    });
    return () => unsubscribe();
  }, []);

  const canManage = role === "developer" || role === "admin" || role === "ketua_kelas";
  const getCourse = (courseId?: string) => {
    if (!courseId) return null;
    return courses.find((c) => c.id === courseId);
  };

  const filteredEvents = events.filter((e) => {
    return selectedType === "all" || e.type === selectedType;
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 7, 30));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    currentDate
  );

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDayIndex + 6) % 7;

  const calendarDays = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }
  const remaining = 35 - calendarDays.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      calendarDays.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }
  }

  const getEventsForDay = (y: number, m: number, d: number) => {
    const formattedDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return filteredEvents.filter((ev) => {
      return ev.startDate <= formattedDate && ev.endDate >= formattedDate;
    });
  };

  const handleEdit = (e: CalendarEvent, evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEditingEvent(e);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string, evt: React.MouseEvent) => {
    evt.stopPropagation();
    if (confirm(`Hapus acara "${title}" dari kalender?`)) {
      deleteCalendarEvent(id);
    }
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Kalender Akademik {activeClass ? `• ${activeClass.name}` : ""}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jadwal Perkuliahan, Ujian (UTS/UAS), Deadline Tugas, & Libur {activeClass ? activeClass.name : "Kelas"}
          </p>
        </div>

        {canManage && (
          <BrutalButton
            onClick={handleAddNew}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Agenda
          </BrutalButton>
        )}
      </div>

      {/* Toolbar & Month Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 px-2">
            {monthName}
          </h2>

          <button
            onClick={goToToday}
            className="px-3 py-1 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Bulan Ini
          </button>
        </div>

        {/* View Switcher & Event Type Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Event Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Semua" },
              { id: "uts", label: "UTS" },
              { id: "uas", label: "UAS" },
              { id: "deadline", label: "Deadline" },
              { id: "seminar", label: "Seminar" },
              { id: "libur", label: "Libur" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-2.5 py-1 text-xs rounded-xl font-medium select-none transition-all ${
                  selectedType === type.id
                    ? "bg-blue-600 text-white font-semibold shadow-soft-xs"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-xs font-heading font-medium rounded-lg select-none ${
                viewMode === "month"
                  ? "bg-white text-slate-900 shadow-soft-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1 text-xs font-heading font-medium rounded-lg select-none ${
                viewMode === "agenda"
                  ? "bg-white text-slate-900 shadow-soft-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* 1. MONTH VIEW */}
      {viewMode === "month" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
          {/* Day Headers (Senin to Minggu) */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center font-sans text-xs font-semibold text-slate-500 py-2.5">
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div>Sabtu</div>
            <div>Minggu</div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((cell, idx) => {
              const dayEvents = getEventsForDay(cell.year, cell.month, cell.day);
              const isToday =
                cell.year === 2026 && cell.month === 7 && cell.day === 30;

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth
                      ? isToday
                        ? "bg-blue-50/40"
                        : "bg-white hover:bg-slate-50/50"
                      : "bg-slate-50/40 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? "bg-blue-600 text-white font-bold shadow-soft-xs"
                          : cell.isCurrentMonth
                          ? "text-slate-700"
                          : "text-slate-300"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[75px]">
                    {dayEvents.map((ev) => {
                      const typeConfig = EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.kuliah;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => {
                            if (canManage) {
                              setEditingEvent(ev);
                              setIsModalOpen(true);
                            }
                          }}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-md border truncate ${canManage ? "cursor-pointer" : "cursor-default"} transition-opacity hover:opacity-85 flex items-center gap-1 ${typeConfig.bg}`}
                          title={`${ev.title} (${ev.time || ""})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeConfig.dot}`} />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AGENDA VIEW */}
      {viewMode === "agenda" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Daftar Agenda Perkuliahan Mendatang
          </h3>

          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada agenda kegiatan yang cocok dengan filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents
                .sort((a, b) => a.startDate.localeCompare(b.startDate))
                .map((ev) => {
                  const typeConfig = EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.kuliah;
                  const course = getCourse(ev.courseId);

                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${typeConfig.bg}`}>
                            {typeConfig.label}
                          </span>
                          <span className="text-xs font-medium text-blue-700">
                            {formatDateIndo(ev.startDate)}
                            {ev.endDate !== ev.startDate && ` s.d ${formatDateIndo(ev.endDate)}`}
                          </span>
                          {course && (
                            <span className="text-xs font-mono px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                              {course.code} - {course.name}
                            </span>
                          )}
                        </div>

                        <h4 className="font-heading font-semibold text-base text-slate-900">
                          {ev.title}
                        </h4>

                        {ev.description && (
                          <p className="text-xs text-slate-600">{ev.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          {ev.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {ev.time}
                            </span>
                          )}
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleEdit(ev, e)}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(ev.id, ev.title, e)}
                            className="p-2 border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 rounded-xl"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        initialEvent={editingEvent}
      />
    </div>
  );
}
