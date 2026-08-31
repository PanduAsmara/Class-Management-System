"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Kanban,
  List,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import {
  getAssignments,
  getCourses,
  updateAssignment,
  deleteAssignment,
  getUserRole,
  getActiveClass,
  subscribeToStore
} from "@/lib/storage";
import { Assignment, Course, AssignmentPriority, AssignmentStatus, UserRole, ClassCohort } from "@/types";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { AssignmentModal } from "@/components/assignments/AssignmentModal";
import { WhatsAppBroadcastModal } from "@/components/whatsapp/WhatsAppBroadcastModal";
import { formatDeadlineAlertMessage } from "@/lib/whatsapp-service";
import { getRelativeDays, formatShortDate } from "@/lib/utils";

const STATUS_COLUMNS: { id: AssignmentStatus; label: string; dotColor: string }[] = [
  { id: "belum_mulai", label: "Belum Mulai", dotColor: "bg-slate-400" },
  { id: "progress", label: "In Progress", dotColor: "bg-amber-500" },
  { id: "selesai", label: "Selesai", dotColor: "bg-emerald-500" },
  { id: "terlambat", label: "Terlambat", dotColor: "bg-rose-500" },
];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // WhatsApp Alert Modal State
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waMessage, setWaMessage] = useState("");

  useEffect(() => {
    setAssignments(getAssignments());
    setCourses(getCourses());
    setRole(getUserRole());
    setActiveClass(getActiveClass());

    const unsubscribe = subscribeToStore(() => {
      setAssignments(getAssignments());
      setCourses(getCourses());
      setRole(getUserRole());
      setActiveClass(getActiveClass());
    });
    return () => unsubscribe();
  }, []);

  const canManage = role === "developer" || role === "admin" || role === "ketua_kelas";
  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === "all" || a.courseId === selectedCourse;
    const matchesPriority = selectedPriority === "all" || a.priority === selectedPriority;

    return matchesSearch && matchesCourse && matchesPriority;
  });

  const handleStatusChange = (id: string, newStatus: AssignmentStatus) => {
    updateAssignment(id, {
      status: newStatus,
      isCompletedByStudent: newStatus === "selesai",
    });
  };

  const handleToggleChecklist = (assignmentId: string, checkId: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg || !asg.checklist) return;

    const updatedChecklist = asg.checklist.map((c) =>
      c.id === checkId ? { ...c, done: !c.done } : c
    );

    const allDone = updatedChecklist.every((c) => c.done);
    updateAssignment(assignmentId, {
      checklist: updatedChecklist,
      status: allDone ? "selesai" : asg.status === "selesai" ? "progress" : asg.status,
    });
  };

  const handleEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus tugas "${title}"?`)) {
      deleteAssignment(id);
    }
  };

  const handleAddNew = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const handleOpenWaAlert = (asg: Assignment) => {
    const course = getCourse(asg.courseId);
    const formatted = formatDeadlineAlertMessage(activeClass, asg, course);
    setWaMessage(formatted);
    setIsWaModalOpen(true);
  };

  const getPriorityBadgeVariant = (priority: AssignmentPriority) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
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
              Tugas & Deadline {activeClass ? `• ${activeClass.name}` : ""}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kanban Board, Checklist Pengerjaan Mandiri, & Pengumpulan Tugas {activeClass ? activeClass.name : "Kelas"}
          </p>
        </div>

        {canManage && (
          <BrutalButton
            onClick={handleAddNew}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Buat Tugas Baru
          </BrutalButton>
        )}
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tugas atau instruksi..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-slate-100/80 rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-heading font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-soft-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-heading font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all select-none ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-soft-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        {courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Filter Mata Kuliah:
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
                Filter Prioritas:
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Semua Prioritas</option>
                <option value="high">High (Tinggi / Mendesak)</option>
                <option value="medium">Medium (Sedang)</option>
                <option value="low">Low (Rendah)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="p-12 border border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-soft-xs">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Belum ada tugas atau praktikum untuk {activeClass?.name || "kelas ini"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {canManage
                ? "Buat tugas baru, tentukan deadline, checklist pengerjaan, dan link pengumpulan submission."
                : "Tidak ada deadline tugas yang aktif saat ini."}
            </p>
          </div>
          {canManage && (
            <BrutalButton onClick={handleAddNew} variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Buat Tugas Pertama
            </BrutalButton>
          )}
        </div>
      )}

      {/* 1. KANBAN BOARD VIEW */}
      {viewMode === "kanban" && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {STATUS_COLUMNS.map((column) => {
            const columnTasks = filteredAssignments.filter((a) => a.status === column.id);

            return (
              <div
                key={column.id}
                className="bg-slate-50/60 border border-slate-200/80 rounded-2xl flex flex-col min-h-[450px] overflow-hidden"
              >
                {/* Column Header */}
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                    <span className="font-heading font-semibold text-xs text-slate-800 uppercase tracking-wide">
                      {column.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task Cards Column */}
                <div className="p-3 flex-1 space-y-3 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center text-xs text-slate-400">
                      Tidak ada tugas
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const course = getCourse(task.courseId);
                      const relative = getRelativeDays(task.deadline);
                      const isHigh = task.priority === "high";

                      return (
                        <div
                          key={task.id}
                          className="bg-white border border-slate-200/80 rounded-xl shadow-soft-xs hover:shadow-soft-sm transition-all p-3.5 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                              {course?.code || "TMJ"}
                            </span>
                            <div className="flex items-center gap-1">
                              <BrutalBadge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                                {task.priority}
                              </BrutalBadge>
                              {/* WhatsApp Quick Alert Button */}
                              <button
                                onClick={() => handleOpenWaAlert(task)}
                                className="p-1 hover:bg-emerald-50 rounded text-emerald-600 transition-colors"
                                title="Kirim Pengingat Deadline ke WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className={isHigh ? "font-medium text-rose-600" : "text-slate-500"}>
                              {relative} ({formatShortDate(task.deadline)})
                            </span>
                          </div>

                          {/* Checklists */}
                          {task.checklist && task.checklist.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                              <div className="text-[10px] font-semibold uppercase text-slate-400 flex justify-between">
                                <span>Checklist Mahasiswa</span>
                                <span>
                                  {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
                                </span>
                              </div>
                              {task.checklist.map((c) => (
                                <label
                                  key={c.id}
                                  className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={c.done}
                                    onChange={() => handleToggleChecklist(task.id, c.id)}
                                    className="minimal-check mt-0.5 shrink-0 scale-90"
                                  />
                                  <span
                                    className={`leading-tight ${
                                      c.done ? "line-through text-slate-400 font-normal" : "text-slate-800 font-medium"
                                    }`}
                                  >
                                    {c.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Status Mover & Actions */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(task.id, e.target.value as AssignmentStatus)
                              }
                              className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer text-slate-700"
                            >
                              <option value="belum_mulai">Belum Mulai</option>
                              <option value="progress">In Progress</option>
                              <option value="selesai">Selesai</option>
                              <option value="terlambat">Terlambat</option>
                            </select>

                            <div className="flex items-center gap-1">
                              {task.submissionLink && (
                                <a
                                  href={task.submissionLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Buka Link Pengumpulan"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {canManage && (
                                <>
                                  <button
                                    onClick={() => handleEdit(task)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                                    title="Edit Tugas"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(task.id, task.title)}
                                    className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                                    title="Hapus Tugas"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST TABLE VIEW */}
      {viewMode === "list" && filteredAssignments.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
          <table className="minimal-table">
            <thead>
              <tr>
                <th className="w-10">Done</th>
                <th>Mata Kuliah</th>
                <th>Judul Tugas</th>
                <th>Prioritas</th>
                <th>Batas Waktu</th>
                <th>Status</th>
                <th>Pengumpulan</th>
                <th className="text-center">WhatsApp</th>
                {canManage && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((task) => {
                const course = getCourse(task.courseId);
                const isDone = task.status === "selesai";

                return (
                  <tr key={task.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() =>
                          handleStatusChange(task.id, isDone ? "progress" : "selesai")
                        }
                        className="minimal-check"
                      />
                    </td>
                    <td className="font-mono text-xs font-medium text-slate-700">{course?.code || "TMJ"}</td>
                    <td>
                      <div className={`font-medium text-sm text-slate-900 ${isDone ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {task.description}
                      </div>
                    </td>
                    <td>
                      <BrutalBadge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                        {task.priority}
                      </BrutalBadge>
                    </td>
                    <td className="text-xs font-medium text-rose-600">
                      {getRelativeDays(task.deadline)} ({formatShortDate(task.deadline)})
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value as AssignmentStatus)
                        }
                        className="text-xs rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 outline-none cursor-pointer text-slate-700"
                      >
                        <option value="belum_mulai">Belum Mulai</option>
                        <option value="progress">In Progress</option>
                        <option value="selesai">Selesai</option>
                        <option value="terlambat">Terlambat</option>
                      </select>
                    </td>
                    <td>
                      {task.submissionLink ? (
                        <a
                          href={task.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                        >
                          Submit <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleOpenWaAlert(task)}
                        className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600"
                        title="Kirim Alert WA"
                      >
                        <MessageSquare className="w-4 h-4 inline" />
                      </button>
                    </td>
                    {canManage && (
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id, task.title)}
                            className="p-1 hover:bg-rose-50 rounded text-rose-500"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAssignment(null);
        }}
        initialAssignment={editingAssignment}
      />

      {/* WhatsApp Broadcast Modal */}
      <WhatsAppBroadcastModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        title="Pengingat Deadline Tugas (WhatsApp)"
        defaultMessage={waMessage}
      />
    </div>
  );
}
