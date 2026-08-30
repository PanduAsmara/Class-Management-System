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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Course Stats Card */}
      <BrutalCard
        header={
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Ringkasan {activeClass ? activeClass.name : "Akademik"}</span>
          </div>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-2xl text-blue-600">
              {courses.length}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              Mata Kuliah
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-2xl text-emerald-600">
              {totalSks}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              Total SKS
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-2xl text-amber-600">
              {materials.length}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              File Materi
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="font-heading font-extrabold text-2xl text-rose-600">
              {assignments.length}
            </div>
            <div className="text-[11px] font-sans text-slate-500 font-medium mt-0.5">
              Total Tugas
            </div>
          </div>
        </div>

        {/* Centered Quick Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3 justify-between">
          <Link href="/courses" className="flex-1 min-w-[130px]">
            <BrutalButton
              variant="neutral"
              size="sm"
              icon={<BookOpen className="w-4 h-4 text-blue-600" />}
              className="w-full text-xs justify-center py-2"
            >
              Lihat Matkul
            </BrutalButton>
          </Link>
          <Link href="/notes" className="flex-1 min-w-[130px]">
            <BrutalButton
              variant="neutral"
              size="sm"
              icon={<FileEdit className="w-4 h-4 text-indigo-600" />}
              className="w-full text-xs justify-center py-2"
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
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-heading font-extrabold text-3xl text-slate-900">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-400 font-sans ml-2">
                ({completedTasks} dari {totalTasks} selesai)
              </span>
            </div>
            <span className="text-xs font-sans font-medium text-emerald-600">
              {totalTasks === 0 ? "Belum Ada Tugas" : completedTasks === totalTasks ? "Semua Beres! 🎉" : "Sedang Berjalan"}
            </span>
          </div>

          {/* Minimalist Rounded Progress Bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Status Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="font-bold text-slate-800">{pendingTasks}</div>
              <div className="text-[11px] text-slate-400">Belum Mulai</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="font-bold text-amber-700">{inProgressTasks}</div>
              <div className="text-[11px] text-amber-600">In Progress</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="font-bold text-emerald-700">{completedTasks}</div>
              <div className="text-[11px] text-emerald-600">Selesai</div>
            </div>
          </div>
        </div>
      </BrutalCard>
    </div>
  );
};
