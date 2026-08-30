"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderDown,
  Plus,
  Search,
  FileText,
  Video,
  Download,
  ExternalLink,
  Edit2,
  Trash2
} from "lucide-react";
import {
  getMaterials,
  getCourses,
  deleteMaterial,
  getUserRole,
  getActiveClass,
  subscribeToStore
} from "@/lib/storage";
import { Material, Course, MaterialAttachmentType, UserRole, ClassCohort } from "@/types";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { MaterialModal } from "@/components/materials/MaterialModal";
import { formatShortDate } from "@/lib/utils";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    setMaterials(getMaterials());
    setCourses(getCourses());
    setRole(getUserRole());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setMaterials(getMaterials());
      setCourses(getCourses());
      setRole(getUserRole());
      setActiveClass(getActiveClass());
    });
    return () => unsubscribe();
  }, []);

  const canManage = role === "developer" || role === "admin" || role === "ketua_kelas";
  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === "all" || m.courseId === selectedCourse;
    const matchesWeek = selectedWeek === "all" || m.week === selectedWeek;
    const matchesType = selectedType === "all" || m.attachmentType === selectedType;

    return matchesSearch && matchesCourse && matchesWeek && matchesType;
  });

  const handleEdit = (m: Material) => {
    setEditingMaterial(m);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus materi "${title}"?`)) {
      deleteMaterial(id);
    }
  };

  const handleAddNew = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const getTypeBadgeVariant = (type: MaterialAttachmentType) => {
    switch (type) {
      case "pdf":
        return "danger";
      case "ppt":
        return "warning";
      case "docx":
        return "primary";
      case "youtube":
        return "danger";
      case "gdrive":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Pusat Materi & Modul {activeClass ? `• ${activeClass.name}` : ""}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Arsip Slide Kuliah, Modul Praktikum, Source Code, & Video Tutorial {activeClass ? activeClass.name : "Kelas"}
          </p>
        </div>

        {canManage && (
          <BrutalButton
            onClick={handleAddNew}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Unggah Materi
          </BrutalButton>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi kuliah, modul praktikum, slide..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">
              Mata Kuliah:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Semua Mata Kuliah</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">
              Minggu Pertemuan:
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Semua Minggu (1 - 16)</option>
              {Array.from({ length: 16 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Minggu Ke-{i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">
              Format Berkas:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Semua Format</option>
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="ppt">PowerPoint (.ppt)</option>
              <option value="docx">Word (.docx)</option>
              <option value="zip">ZIP / Archive (.zip)</option>
              <option value="gdrive">Google Drive</option>
              <option value="youtube">YouTube Video</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-soft-xs">
            <FolderDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Belum ada berkas materi untuk {activeClass?.name || "kelas ini"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {canManage
                ? "Unggah slide kuliah, modul praktikum PDF, tautan Google Drive, atau video tutorial materi."
                : "Belum ada berkas materi perkuliahan yang diunggah."}
            </p>
          </div>
          {canManage && (
            <BrutalButton onClick={handleAddNew} variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Unggah Materi Pertama
            </BrutalButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => {
            const course = getCourse(mat.courseId);
            return (
              <div
                key={mat.id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-mono text-xs font-semibold">
                        Minggu {mat.week}
                      </span>
                      <BrutalBadge variant={getTypeBadgeVariant(mat.attachmentType)} size="sm">
                        {mat.attachmentType.toUpperCase()}
                      </BrutalBadge>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 font-medium mb-1">
                      {course?.code} • {course?.name}
                    </div>

                    <h3 className="font-heading font-semibold text-sm sm:text-base text-slate-900 leading-snug">
                      {mat.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {mat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Diunggah: {formatShortDate(mat.uploadedAt)}</span>
                    <span className="font-medium text-slate-600">{mat.fileSize || "File"}</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <a
                    href={mat.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors shadow-soft-xs"
                  >
                    {mat.attachmentType === "youtube" ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Buka / Unduh</span>
                  </a>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(mat)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Materi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id, mat.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Material Modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMaterial(null);
        }}
        initialMaterial={editingMaterial}
      />
    </div>
  );
}
