"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, MapPin, Video, User, ArrowRight, CalendarDays, ExternalLink } from "lucide-react";
import { getSchedules, getCourses, subscribeToStore } from "@/lib/storage";
import { Schedule, Course, DayOfWeek } from "@/types";
import { BrutalCard } from "../ui/BrutalCard";
import { BrutalBadge } from "../ui/BrutalBadge";

const DAYS_MAP: { [key: number]: DayOfWeek } = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

export const TodayScheduleWidget: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentDay, setCurrentDay] = useState<DayOfWeek>("Senin");

  useEffect(() => {
    const todayIndex = new Date().getDay();
    const dayName = DAYS_MAP[todayIndex] || "Senin";
    setCurrentDay(dayName);
    setSchedules(getSchedules());
    setCourses(getCourses());

    const unsubscribe = subscribeToStore(() => {
      setSchedules(getSchedules());
      setCourses(getCourses());
    });
    return () => unsubscribe();
  }, []);

  const effectiveDay: DayOfWeek = (currentDay === "Minggu" || currentDay === "Sabtu") ? "Senin" : currentDay;
  const todaySchedules = schedules
    .filter((s) => s.day === effectiveDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getCourseInfo = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  return (
    <BrutalCard
      header={
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span>Jadwal Kuliah ({effectiveDay})</span>
        </div>
      }
      badge={
        <BrutalBadge variant="primary" size="sm">
          {todaySchedules.length} Kelas
        </BrutalBadge>
      }
      footer={
        <Link
          href="/schedule"
          className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          Lihat Jadwal Lengkap Mingguan <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="h-full"
    >
      {todaySchedules.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-semibold text-sm text-slate-700">
            Tidak ada jadwal kuliah untuk hari {effectiveDay}.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Waktunya istirahat atau mengerjakan tugas mandiri! ✨
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todaySchedules.map((item) => {
            const course = getCourseInfo(item.courseId);
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all duration-150 relative"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {course?.code || "TMJ"}
                    </span>
                    <span className="font-heading font-semibold text-sm text-slate-900">
                      {course?.name || "Mata Kuliah"}
                    </span>
                  </div>
                  {item.type && (
                    <BrutalBadge
                      variant={item.type === "Praktikum" ? "warning" : "neutral"}
                      size="sm"
                    >
                      {item.type}
                    </BrutalBadge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium text-blue-600">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.startTime} - {item.endTime} WIB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:col-span-2 text-slate-500">
                    <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.lecturer}</span>
                  </div>
                </div>

                {item.meetingLink && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex justify-end">
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Link Kelas Online <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </BrutalCard>
  );
};
