"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { getAssignments, getCourses, updateAssignment, subscribeToStore } from "@/lib/storage";
import { Assignment, Course } from "@/types";
import { BrutalCard } from "../ui/BrutalCard";
import { BrutalBadge } from "../ui/BrutalBadge";
import { getRelativeDays, formatShortDate } from "@/lib/utils";

export const NearestDeadlinesWidget: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setAssignments(getAssignments());
    setCourses(getCourses());

    const unsubscribe = subscribeToStore(() => {
      setAssignments(getAssignments());
      setCourses(getCourses());
    });
    return () => unsubscribe();
  }, []);

  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);

  const pendingAssignments = assignments
    .filter((a) => a.status !== "selesai")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  const toggleComplete = (assignment: Assignment) => {
    const nextStatus = assignment.status === "selesai" ? "progress" : "selesai";
    updateAssignment(assignment.id, {
      status: nextStatus,
      isCompletedByStudent: nextStatus === "selesai",
    });
  };

  return (
    <BrutalCard
      header={
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-600" />
          <span>Deadline Terdekat</span>
        </div>
      }
      badge={
        <BrutalBadge variant="danger" size="sm">
          {pendingAssignments.length} Tugas
        </BrutalBadge>
      }
      footer={
        <Link
          href="/assignments"
          className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          Lihat Semua Tugas & Kanban <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="h-full"
    >
      {pendingAssignments.length === 0 ? (
        <div className="py-10 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-sm text-slate-800">
            Hore! Semua tugas telah selesai.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Tidak ada deadline yang mendesak saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingAssignments.map((item) => {
            const course = getCourse(item.courseId);
            const relativeTime = getRelativeDays(item.deadline);
            const isUrgent = item.priority === "high" || relativeTime.includes("Hari Ini") || relativeTime.includes("Besok");

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3"
              >
                <input
                  type="checkbox"
                  checked={item.status === "selesai"}
                  onChange={() => toggleComplete(item)}
                  className="minimal-check mt-0.5 shrink-0"
                  title="Tandai selesai"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700">
                      {course?.code || "TMJ"}
                    </span>
                    <BrutalBadge
                      variant={
                        item.priority === "high"
                          ? "danger"
                          : item.priority === "medium"
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {item.priority}
                    </BrutalBadge>
                    <span
                      className={`text-[11px] font-sans font-medium px-2 py-0.5 rounded-full ${
                        isUrgent
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {relativeTime}
                    </span>
                  </div>

                  <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 leading-tight line-clamp-1">
                    {item.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Deadline: {formatShortDate(item.deadline)}</span>
                    {item.checklist && item.checklist.length > 0 && (
                      <span>
                        • Sub-task: {item.checklist.filter((c) => c.done).length}/{item.checklist.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BrutalCard>
  );
};
