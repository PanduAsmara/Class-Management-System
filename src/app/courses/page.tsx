"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  User,
  MapPin,
  Edit2,
  Trash2,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Building2
} from "lucide-react";
import { getCourses, deleteCourse, getUserRole, getActiveClass, subscribeToStore } from "@/lib/storage";
import { Course, UserRole, ClassCohort } from "@/types";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { CourseModal } from "@/components/courses/CourseModal";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<number | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourses(getCourses());
    setRole(getUserRole());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setCourses(getCourses());
      setRole(getUserRole());
      setActiveClass(getActiveClass());
    });
    return () => unsubscribe();
  }, []);

  const canManage = role === "developer" || role === "admin" || role === "ketua_kelas";

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester =
      selectedSemester === "all" || c.semester === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  const totalSks = filteredCourses.reduce((acc, c) => acc + (c.sks || 0), 0);

  const handleEdit = (c: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(c);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Hapus mata kuliah "${name}"?`)) {
      deleteCourse(id);
    }
  };

  const handleAddNew = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Mata Kuliah {activeClass ? `• ${activeClass.name}` : ""}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kurikulum & Silabus Perkuliahan {activeClass ? `${activeClass.name} (Semester ${activeClass.semester})` : "Kelas"}
          </p>
        </div>

        {canManage && (
          <BrutalButton
            onClick={handleAddNew}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Matkul
          </BrutalButton>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama matkul, kode (TMJ201), atau dosen..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Semester Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(["all", 1, 2, 3, 4, 5, 6, 7, 8] as const).map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all select-none ${
                selectedSemester === sem
                  ? "bg-blue-600 text-white font-semibold shadow-soft-xs"
                  : "bg-slate-100/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {sem === "all" ? "Semua" : `Sem ${sem}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-medium text-blue-800">
        <span>Menampilkan {filteredCourses.length} Mata Kuliah</span>
        <span className="font-semibold">
          Total Beban: {totalSks} SKS
        </span>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-soft-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Belum ada mata kuliah untuk {activeClass?.name || "kelas ini"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {canManage
                ? "Mulai dengan menambahkan mata kuliah pertama, silabus, dosen pengampu, dan SKS perkuliahan."
                : "Mata kuliah belum diinput oleh pengurus / ketua kelas."}
            </p>
          </div>
          {canManage && (
            <BrutalButton onClick={handleAddNew} variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Tambah Mata Kuliah Pertama
            </BrutalButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Colored top bar */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: c.color || "#2563EB" }}
              />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {c.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <BrutalBadge variant="primary" size="sm">
                        {c.sks} SKS
                      </BrutalBadge>
                      <BrutalBadge variant="neutral" size="sm">
                        Sem {c.semester}
                      </BrutalBadge>
                    </div>
                  </div>

                  <Link href={`/courses/${c.id}`}>
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 mt-1">
                      {c.name}
                    </h3>
                  </Link>

                  {c.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700">{c.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.room || "Ruang Kelas"}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <Link
                  href={`/courses/${c.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  Buka Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEdit(c, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Mata Kuliah"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(c.id, c.name, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Mata Kuliah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        initialCourse={editingCourse}
      />
    </div>
  );
}
