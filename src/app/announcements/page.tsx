"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  FileText,
  User,
  ExternalLink,
  Edit2,
  Trash2
} from "lucide-react";
import {
  getAnnouncements,
  getCourses,
  deleteAnnouncement,
  getUserRole,
  getActiveClass,
  subscribeToStore
} from "@/lib/storage";
import { Announcement, Course, AnnouncementCategory, UserRole, ClassCohort } from "@/types";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { AnnouncementModal } from "@/components/announcements/AnnouncementModal";
import { formatShortDate, formatDateIndo } from "@/lib/utils";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  useEffect(() => {
    setAnnouncements(getAnnouncements());
    setCourses(getCourses());
    setRole(getUserRole());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setAnnouncements(getAnnouncements());
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

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || ann.category === selectedCategory;

    const matchesCourse =
      selectedCourse === "all" ||
      (selectedCourse === "umum" && !ann.targetCourseId) ||
      ann.targetCourseId === selectedCourse;

    return matchesSearch && matchesCategory && matchesCourse;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.pinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.pinned);

  const handleEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus pengumuman "${title}"?`)) {
      deleteAnnouncement(id);
    }
  };

  const handleAddNew = () => {
    setEditingAnn(null);
    setIsModalOpen(true);
  };

  const getCategoryBadgeVariant = (cat: AnnouncementCategory) => {
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Pusat Pengumuman {activeClass ? `• ${activeClass.name}` : ""}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Informasi Resmi, Pengingat Deadline, & Pengumuman {activeClass ? activeClass.name : "Kelas"}
          </p>
        </div>

        {canManage && (
          <BrutalButton
            onClick={handleAddNew}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Buat Pengumuman
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
            placeholder="Cari pengumuman, kata kunci, narasumber..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Category Pills & Course Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Semua" },
              { id: "urgent", label: "Urgent" },
              { id: "important", label: "Important" },
              { id: "reminder", label: "Reminder" },
              { id: "info", label: "Info" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all select-none ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white font-semibold shadow-soft-xs"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {courses.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">
                Matkul:
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Semua Target</option>
                <option value="umum">Pengumuman Umum Saja</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Announcements Stream */}
      {filteredAnnouncements.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-soft-xs">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Belum ada pengumuman untuk {activeClass?.name || "kelas ini"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {canManage
                ? "Bagikan broadcast pengumuman penting, info perkuliahan, atau perubahan ruang kelas kepada mahasiswa."
                : "Belum ada broadcast pengumuman yang diposting."}
            </p>
          </div>
          {canManage && (
            <BrutalButton onClick={handleAddNew} variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Buat Pengumuman Pertama
            </BrutalButton>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned Items */}
          {pinnedAnnouncements.map((ann) => {
            const course = getCourse(ann.targetCourseId);
            return (
              <div
                key={ann.id}
                className="bg-amber-50/40 border border-amber-200/80 rounded-2xl shadow-card p-5 space-y-2 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
                      <Pin className="w-3 h-3 text-rose-500" /> Pinned Urgent
                    </span>
                    <BrutalBadge variant={getCategoryBadgeVariant(ann.category)} size="sm">
                      {ann.category}
                    </BrutalBadge>
                    {course ? (
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white border border-amber-200 text-slate-700">
                        {course.code} - {course.name}
                      </span>
                    ) : (
                      <span className="text-xs font-sans px-2 py-0.5 rounded bg-white border border-amber-200 text-slate-600">
                        Umum Kelas
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500">
                    {formatDateIndo(ann.date)}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 mt-1">
                  {ann.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {/* Attachments */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex flex-wrap gap-2">
                    {ann.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-blue-600 hover:bg-amber-50 transition-colors shadow-soft-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>{att.name}</span>
                        <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Dibuat oleh: <strong className="text-slate-700 font-semibold">{ann.author}</strong>
                  </span>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(ann)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id, ann.title)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Regular Announcements */}
          {regularAnnouncements.map((ann) => {
            const course = getCourse(ann.targetCourseId);
            return (
              <div
                key={ann.id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-5 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <BrutalBadge variant={getCategoryBadgeVariant(ann.category)} size="sm">
                      {ann.category}
                    </BrutalBadge>
                    {course ? (
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {course.code} - {course.name}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Umum
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDateIndo(ann.date)}
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-base text-slate-900">
                  {ann.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    {ann.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-blue-600 hover:bg-slate-100"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{att.name}</span>
                        <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-300" /> {ann.author}
                  </span>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(ann)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id, ann.title)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-500"
                        title="Hapus"
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

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnn(null);
        }}
        initialAnnouncement={editingAnn}
      />
    </div>
  );
}
