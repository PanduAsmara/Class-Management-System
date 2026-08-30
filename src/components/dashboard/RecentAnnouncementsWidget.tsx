"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone, Pin, ArrowRight, FileText, User } from "lucide-react";
import { getAnnouncements, getCourses, subscribeToStore } from "@/lib/storage";
import { Announcement, Course } from "@/types";
import { BrutalCard } from "../ui/BrutalCard";
import { BrutalBadge } from "../ui/BrutalBadge";
import { formatShortDate } from "@/lib/utils";

export const RecentAnnouncementsWidget: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setAnnouncements(getAnnouncements());
    setCourses(getCourses());

    const unsubscribe = subscribeToStore(() => {
      setAnnouncements(getAnnouncements());
      setCourses(getCourses());
    });
    return () => unsubscribe();
  }, []);

  const getCourse = (courseId?: string) => {
    if (!courseId) return null;
    return courses.find((c) => c.id === courseId);
  };

  const recentList = announcements.slice(0, 3);

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case "urgent":
        return "danger";
      case "important":
        return "warning";
      case "reminder":
        return "primary";
      default:
        return "neutral";
    }
  };

  return (
    <BrutalCard
      header={
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-600" />
          <span>Pengumuman Terbaru</span>
        </div>
      }
      badge={
        <BrutalBadge variant="neutral" size="sm">
          {announcements.length} Total
        </BrutalBadge>
      }
      footer={
        <Link
          href="/announcements"
          className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          Lihat Semua Pengumuman <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="h-full"
    >
      {recentList.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          Belum ada pengumuman kelas.
        </div>
      ) : (
        <div className="space-y-3">
          {recentList.map((ann) => {
            const course = getCourse(ann.targetCourseId);
            return (
              <div
                key={ann.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {ann.pinned && (
                      <span className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-100" title="Disematkan">
                        <Pin className="w-3 h-3" />
                      </span>
                    )}
                    <BrutalBadge variant={getCategoryBadgeVariant(ann.category)} size="sm">
                      {ann.category}
                    </BrutalBadge>
                    {course && (
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {course.code}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatShortDate(ann.date)}
                  </span>
                </div>

                <h4 className="font-heading font-semibold text-sm text-slate-900 leading-snug">
                  {ann.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>

                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-300" /> {ann.author}
                  </span>
                  {ann.attachments && ann.attachments.length > 0 && (
                    <span className="text-blue-600 font-medium flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {ann.attachments.length} Lampiran
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BrutalCard>
  );
};
