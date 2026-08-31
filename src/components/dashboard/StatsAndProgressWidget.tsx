"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  FolderDown,
  Clock,
  Plus,
  FileEdit,
  BarChart3,
  ListTodo,
  ArrowRight
} from "lucide-react";
import {
  getCourses,
  getAssignments,
  getMaterials,
  getUserRole,
  getActiveClass,
  subscribeToStore
} from "@/lib/storage";
import { Course, Assignment, Material, UserRole, ClassCohort } from "@/types";
import { BrutalCard } from "../ui/BrutalCard";
import { BrutalButton } from "../ui/BrutalButton";

export const StatsAndProgressWidget: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [role, setRole] = useState<UserRole>("mahasiswa");

  useEffect(() => {
    setCourses(getCourses());
    setAssignments(getAssignments());
    setMaterials(getMaterials());
    setRole(getUserRole());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setCourses(getCourses());
      setAssignments(getAssignments());
      setMaterials(getMaterials());
      setRole(getUserRole());
      setActiveClass(getActiveClass());
    });
    return () => unsubscribe();
  }, []);

  const totalSks = courses.reduce((acc, c) => acc + (c.sks || 0), 0);
  const completedTasks = assignments.filter((a) => a.status === "selesai").length;
  const inProgressTasks = assignments.filter((a) => a.status === "progress").length;
  const pendingTasks = assignments.filter((a) => a.status === "belum_mulai").length;
  const totalTasks = assignments.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
      {/* Course Stats Card */}
      <BrutalCard
        header={
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Ringkasan {activeClass ? activeClass.name : "Akademik"}</span>
          </div>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-xl sm:text-2xl text-blue-600">
              {courses.length}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              Mata Kuliah
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-xl sm:text-2xl text-emerald-600">
              {totalSks}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              Total SKS
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-xl sm:text-2xl text-amber-600">
              {materials.length}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              File Materi
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-xl sm:text-2xl text-rose-600">
              {assignments.length}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              Total Tugas
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <Link href="/courses" className="flex-1">
            <BrutalButton
              variant="neutral"
              size="sm"
              icon={<BookOpen className="w-4 h-4 text-blue-600" />}
              className="w-full text-xs justify-center py-2.5"
            >
              Lihat Matkul
            </BrutalButton>
          </Link>
          <Link href="/notes" className="flex-1">
            <BrutalButton
              variant="neutral"
              size="sm"
              icon={<FileEdit className="w-4 h-4 text-indigo-600" />}
              className="w-full text-xs justify-center py-2.5"
            >
              Buka Catatan
            </BrutalButton>
          </Link>
        </div>
      </BrutalCard>

      {/* Task Progress Card */}
      <BrutalCard
        header={
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-emerald-600" />
            <span>Progress Penyelesaian Tugas</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-600">Total Selesai</span>
              <span className="font-heading font-bold text-slate-900">
                {completedTasks}/{totalTasks} Tugas ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="font-heading font-bold text-slate-800 text-sm">{pendingTasks}</div>
              <div className="text-[10px] text-slate-400">Belum Mulai</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900">
              <div className="font-heading font-bold text-sm">{inProgressTasks}</div>
              <div className="text-[10px] text-amber-700">In Progress</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900">
              <div className="font-heading font-bold text-sm">{completedTasks}</div>
              <div className="text-[10px] text-emerald-700">Selesai</div>
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <Link
              href="/assignments"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Lihat Semua Tugas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </BrutalCard>
    </div>
  );
};
