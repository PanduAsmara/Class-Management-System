"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Save,
  CheckSquare,
  Code,
  Quote,
  Eye,
  Edit3,
  BookOpen
} from "lucide-react";
import {
  getNotes,
  getCourses,
  addNote,
  updateNote,
  deleteNote,
  subscribeToStore
} from "@/lib/storage";
import { Note, Course } from "@/types";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { formatShortDate } from "@/lib/utils";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">("split");

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCourseId, setEditCourseId] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPinned, setEditPinned] = useState(false);

  useEffect(() => {
    const noteList = getNotes();
    setNotes(noteList);
    setCourses(getCourses());

    if (noteList.length > 0 && !selectedNoteId) {
      const firstNote = noteList[0];
      setSelectedNoteId(firstNote.id);
      loadNoteToEditor(firstNote);
    }

    const unsubscribe = subscribeToStore(() => {
      const currentList = getNotes();
      setNotes(currentList);
      setCourses(getCourses());
    });
    return () => unsubscribe();
  }, []);

  const loadNoteToEditor = (note: Note) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCourseId(note.courseId || "");
    setEditTags(note.tags.join(", "));
    setEditPinned(!!note.isPinned);
  };

  const handleSelectNote = (note: Note) => {
    loadNoteToEditor(note);
  };

  const handleCreateNewNote = () => {
    const newNote = addNote({
      title: "Catatan Baru TMJ",
      content: `# Rangkuman Materi Kuliah\n\nTulis rangkuman dan ide riset di sini...\n\n### Checklist Praktikum\n- [ ] Persiapan modul & environment\n- [ ] Uji coba skenario\n\n\`\`\`typescript\n// Code snippet\nconst subject = "Teknik Multimedia & Jaringan";\nconsole.log(subject);\n\`\`\`\n\n> Catatan penting dari sesi dosen.`,
      courseId: courses[0]?.id || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["TMJ", "Kuliah"],
      isPinned: false,
    });
    loadNoteToEditor(newNote);
  };

  const handleSave = () => {
    if (!selectedNoteId) return;

    const tagsArray = editTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    updateNote(selectedNoteId, {
      title: editTitle,
      content: editContent,
      courseId: editCourseId || undefined,
      tags: tagsArray,
      isPinned: editPinned,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus catatan pribadi ini?")) {
      deleteNote(id);
      const remaining = notes.filter((n) => n.id !== id);
      if (remaining.length > 0) {
        loadNoteToEditor(remaining[0]);
      } else {
        setSelectedNoteId("");
        setEditTitle("");
        setEditContent("");
      }
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    setEditContent((prev) => prev + `\n${prefix}Teks${suffix}`);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = selectedCourse === "all" || n.courseId === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  const getCourse = (courseId?: string) => {
    if (!courseId) return null;
    return courses.find((c) => c.id === courseId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Catatan Belajar Pribadi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Private Markdown Editor dengan Dukungan Checklist & Code Blocks
          </p>
        </div>

        <BrutalButton
          onClick={handleCreateNewNote}
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Catatan Baru
        </BrutalButton>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Note List */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-card p-4 space-y-3">
          {/* Search & Course Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari catatan / tags..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Semua Mata Kuliah</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Scrollable List */}
          <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada catatan ditemukan.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === selectedNoteId;
                const course = getCourse(note.courseId);

                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                      isSelected
                        ? "bg-blue-50/80 border border-blue-200 shadow-soft-xs"
                        : "bg-white hover:bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      {course ? (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-white text-blue-700 border border-blue-100">
                          {course.code}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Umum</span>
                      )}

                      <div className="flex items-center gap-1">
                        {note.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
                        <span className="text-[10px] text-slate-400">
                          {formatShortDate(note.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-heading font-semibold text-xs text-slate-900 leading-snug line-clamp-1">
                      {note.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {note.content.replace(/#|\*|`|\[|\]/g, "")}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Split Markdown Editor & Live Preview */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col overflow-hidden">
          {selectedNoteId ? (
            <>
              {/* Note Metadata Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Judul Catatan..."
                    className="w-full bg-transparent font-heading font-bold text-lg text-slate-900 outline-none"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditPinned(!editPinned)}
                      className={`p-2 border rounded-xl transition-all ${
                        editPinned ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-slate-400 border-slate-200 hover:text-slate-600"
                      }`}
                      title={editPinned ? "Lepas Sematan" : "Sematkan Catatan"}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <BrutalButton onClick={handleSave} variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                      Simpan
                    </BrutalButton>
                    <button
                      onClick={() => handleDelete(selectedNoteId)}
                      className="p-2 border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Kaitkan ke Mata Kuliah:
                    </label>
                    <select
                      value={editCourseId}
                      onChange={(e) => setEditCourseId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
                    >
                      <option value="">Catatan Bebas (Tanpa Matkul)</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Tags (Pisahkan koma):
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="Jarkom, Cisco, Praktikum..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-4 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => insertMarkdown("## ")}
                    className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => insertMarkdown("### ")}
                    className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <button
                    onClick={() => insertMarkdown("- [ ] ")}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Checklist"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown("```typescript\n", "\n```")}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Code Block"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown("> ")}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Quote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* View Mode (Edit, Preview, Split) */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-xs">
                  <button
                    onClick={() => setActiveTab("edit")}
                    className={`px-2.5 py-1 rounded-lg font-medium ${
                      activeTab === "edit" ? "bg-white text-slate-900 shadow-soft-xs" : "text-slate-600"
                    }`}
                  >
                    <Edit3 className="w-3 h-3 inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => setActiveTab("split")}
                    className={`hidden md:inline-flex px-2.5 py-1 rounded-lg font-medium ${
                      activeTab === "split" ? "bg-white text-slate-900 shadow-soft-xs" : "text-slate-600"
                    }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-2.5 py-1 rounded-lg font-medium ${
                      activeTab === "preview" ? "bg-white text-slate-900 shadow-soft-xs" : "text-slate-600"
                    }`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" /> Preview
                  </button>
                </div>
              </div>

              {/* Editor / Live Preview Panes */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[420px]">
                {/* Editor */}
                {(activeTab === "edit" || activeTab === "split") && (
                  <div className={`p-4 flex flex-col ${activeTab === "edit" ? "md:col-span-2" : ""}`}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Tulis markdown di sini..."
                      className="w-full h-full min-h-[380px] p-3 font-mono text-xs text-slate-900 bg-white outline-none resize-none"
                    />
                  </div>
                )}

                {/* Preview */}
                {(activeTab === "preview" || activeTab === "split") && (
                  <div
                    className={`p-5 overflow-y-auto max-h-[480px] bg-slate-50/40 ${
                      activeTab === "preview" ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-slate-800">
                      {editContent.split("\n").map((line, index) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h1 key={index} className="font-heading font-extrabold text-xl text-slate-900 border-b border-slate-200 pb-1.5 my-3">
                              {line.replace("# ", "")}
                            </h1>
                          );
                        }
                        if (line.startsWith("## ")) {
                          return (
                            <h2 key={index} className="font-heading font-bold text-base text-slate-900 mt-4 mb-2">
                              {line.replace("## ", "")}
                            </h2>
                          );
                        }
                        if (line.startsWith("### ")) {
                          return (
                            <h3 key={index} className="font-heading font-semibold text-sm text-blue-700 mt-3 mb-1">
                              {line.replace("### ", "")}
                            </h3>
                          );
                        }
                        if (line.startsWith("- [x] ")) {
                          return (
                            <div key={index} className="flex items-center gap-2 text-xs text-slate-400 line-through my-1">
                              <span className="w-4 h-4 bg-blue-600 text-white rounded flex items-center justify-center text-[10px] font-bold">✓</span>
                              <span>{line.replace("- [x] ", "")}</span>
                            </div>
                          );
                        }
                        if (line.startsWith("- [ ] ")) {
                          return (
                            <div key={index} className="flex items-center gap-2 text-xs text-slate-800 font-medium my-1">
                              <span className="w-4 h-4 bg-white border border-slate-300 rounded inline-block" />
                              <span>{line.replace("- [ ] ", "")}</span>
                            </div>
                          );
                        }
                        if (line.startsWith("> ")) {
                          return (
                            <blockquote key={index} className="p-3 my-2 border-l-3 border-blue-500 bg-blue-50/50 rounded-r-xl text-xs italic text-slate-700">
                              {line.replace("> ", "")}
                            </blockquote>
                          );
                        }
                        if (line.startsWith("```")) {
                          return (
                            <div key={index} className="p-3 my-2 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto">
                              {line}
                            </div>
                          );
                        }
                        if (!line.trim()) {
                          return <div key={index} className="h-2" />;
                        }
                        return (
                          <p key={index} className="text-xs text-slate-600 leading-relaxed my-1">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Pilih catatan di panel sebelah kiri atau klik &quot;Catatan Baru&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
