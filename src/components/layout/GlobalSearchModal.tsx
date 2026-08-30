"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  CalendarDays,
  Megaphone,
  CheckSquare,
  FolderDown,
  FileText,
  X,
  ArrowRight
} from "lucide-react";
import {
  getCourses,
  getMaterials,
  getAnnouncements,
  getSchedules,
  getAssignments,
  getNotes,
} from "@/lib/storage";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const courses = getCourses().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.lecturer.toLowerCase().includes(q)
  );

  const assignments = getAssignments().filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
  );

  const materials = getMaterials().filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
  );

  const announcements = getAnnouncements().filter(
    (ann) =>
      ann.title.toLowerCase().includes(q) ||
      ann.content.toLowerCase().includes(q)
  );

  const notes = getNotes().filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
  );

  const totalResults =
    courses.length +
    assignments.length +
    materials.length +
    announcements.length +
    notes.length;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Spotlight Dialog Container */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/80 rounded-2xl shadow-soft-xl z-10 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-white">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari mata kuliah, materi, tugas, pengumuman, catatan..."
            className="w-full bg-transparent text-sm font-sans text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 mr-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 border border-slate-200 bg-slate-50 text-[10px] rounded font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1">
          {!q ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Ketik kata kunci untuk mencari data akademik TMJ.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Tidak ditemukan data untuk &quot;{query}&quot;. Coba kata kunci lain.
            </div>
          ) : (
            <>
              {/* Courses */}
              {courses.length > 0 && (
                <div>
                  <div className="text-[11px] font-sans font-semibold uppercase text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Mata Kuliah
                  </div>
                  <div className="space-y-1">
                    {courses.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect(`/courses/${c.id}`)}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="font-medium text-xs text-slate-800 group-hover:text-blue-600">
                            {c.code} - {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {c.sks} SKS • Dosen: {c.lecturer}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignments */}
              {assignments.length > 0 && (
                <div>
                  <div className="text-[11px] font-sans font-semibold uppercase text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-rose-600" /> Tugas & Praktikum
                  </div>
                  <div className="space-y-1">
                    {assignments.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => handleSelect("/assignments")}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="font-medium text-xs text-slate-800 group-hover:text-blue-600">
                            {a.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Deadline: {a.deadline.replace("T", " ")}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {materials.length > 0 && (
                <div>
                  <div className="text-[11px] font-sans font-semibold uppercase text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <FolderDown className="w-3.5 h-3.5 text-emerald-600" /> Materi Kuliah
                  </div>
                  <div className="space-y-1">
                    {materials.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect("/materials")}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="font-medium text-xs text-slate-800 group-hover:text-blue-600">
                            Minggu {m.week}: {m.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Format: {m.attachmentType.toUpperCase()}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {announcements.length > 0 && (
                <div>
                  <div className="text-[11px] font-sans font-semibold uppercase text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-amber-600" /> Pengumuman
                  </div>
                  <div className="space-y-1">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        onClick={() => handleSelect("/announcements")}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="font-medium text-xs text-slate-800 group-hover:text-blue-600">
                            {ann.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {ann.date} • {ann.category.toUpperCase()}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {notes.length > 0 && (
                <div>
                  <div className="text-[11px] font-sans font-semibold uppercase text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" /> Catatan Pribadi
                  </div>
                  <div className="space-y-1">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleSelect("/notes")}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="font-medium text-xs text-slate-800 group-hover:text-blue-600">
                            {n.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Tags: {n.tags.join(", ")}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
