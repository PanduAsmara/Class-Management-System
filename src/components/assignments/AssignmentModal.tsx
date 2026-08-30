"use client";

import React, { useState, useEffect } from "react";
import { Assignment, AssignmentPriority, AssignmentStatus, Course } from "@/types";
import { BrutalModal } from "../ui/BrutalModal";
import { BrutalInput, BrutalTextarea } from "../ui/BrutalInput";
import { BrutalSelect } from "../ui/BrutalSelect";
import { BrutalButton } from "../ui/BrutalButton";
import { addAssignment, updateAssignment, getCourses } from "@/lib/storage";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssignment?: Assignment | null;
  onSaved?: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  initialAssignment,
  onSaved,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    deadline: string;
    courseId: string;
    attachmentUrl: string;
    status: AssignmentStatus;
    priority: AssignmentPriority;
    submissionLink: string;
    checklistsText: string;
  }>({
    title: "",
    description: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    courseId: "",
    attachmentUrl: "",
    status: "progress",
    priority: "high",
    submissionLink: "",
    checklistsText: "",
  });

  useEffect(() => {
    const list = getCourses();
    setCourses(list);
    if (initialAssignment) {
      const checkText = initialAssignment.checklist
        ? initialAssignment.checklist.map((c) => c.text).join("\n")
        : "";
      setFormData({
        title: initialAssignment.title,
        description: initialAssignment.description,
        deadline: initialAssignment.deadline.slice(0, 16),
        courseId: initialAssignment.courseId,
        attachmentUrl: initialAssignment.attachmentUrl || "",
        status: initialAssignment.status,
        priority: initialAssignment.priority,
        submissionLink: initialAssignment.submissionLink || "",
        checklistsText: checkText,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        courseId: list[0]?.id || "",
        attachmentUrl: "",
        status: "progress",
        priority: "high",
        submissionLink: "",
        checklistsText: "Analisis kebutuhan tugas\nImplementasi & Pengujian\nPenyusunan Laporan PDF",
      });
    }
  }, [initialAssignment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.deadline) {
      alert("Judul tugas, mata kuliah, dan tenggat waktu wajib diisi!");
      return;
    }

    const checklistItems = formData.checklistsText
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((text, idx) => ({
        id: `c-${idx + 1}`,
        text,
        done: false,
      }));

    if (initialAssignment) {
      updateAssignment(initialAssignment.id, {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        courseId: formData.courseId,
        attachmentUrl: formData.attachmentUrl,
        status: formData.status,
        priority: formData.priority,
        submissionLink: formData.submissionLink,
        checklist: checklistItems.length > 0 ? checklistItems : initialAssignment.checklist,
      });
    } else {
      addAssignment({
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        courseId: formData.courseId,
        attachmentUrl: formData.attachmentUrl,
        status: formData.status,
        priority: formData.priority,
        submissionLink: formData.submissionLink,
        checklist: checklistItems,
        isCompletedByStudent: false,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  const courseOptions = courses.map((c) => ({
    label: `${c.code} - ${c.name}`,
    value: c.id,
  }));

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAssignment ? "Edit Tugas Perkuliahan" : "Tambah Tugas Baru"}
      subtitle="Kelola instruksi tugas, rubrik, dan batas waktu TMJ"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <BrutalInput
            label="Judul Tugas *"
            placeholder="Contoh: Tugas 2 - Routing Dinamis OSPF"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalSelect
              label="Mata Kuliah *"
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              options={courseOptions}
              required
            />
          </div>
          <div>
            <BrutalInput
              label="Batas Waktu / Deadline *"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalSelect
              label="Prioritas Deadline *"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as AssignmentPriority,
                })
              }
              options={[
                { label: "High (Tinggi / Mendesak)", value: "high" },
                { label: "Medium (Sedang)", value: "medium" },
                { label: "Low (Rendah)", value: "low" },
              ]}
            />
          </div>
          <div>
            <BrutalSelect
              label="Status Pengerjaan"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as AssignmentStatus,
                })
              }
              options={[
                { label: "Belum Mulai", value: "belum_mulai" },
                { label: "Dalam Progress", value: "progress" },
                { label: "Selesai", value: "selesai" },
                { label: "Terlambat", value: "terlambat" },
              ]}
            />
          </div>
        </div>

        <div>
          <BrutalTextarea
            label="Deskripsi & Instruksi Tugas"
            placeholder="Tuliskan petunjuk pengerjaan, format berkas, rubrik penilaian..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <BrutalTextarea
            label="Checklist Sub-Task (Pisahkan per baris)"
            placeholder="Analisis kebutuhan&#10;Desain sketsa&#10;Koding modul"
            rows={3}
            value={formData.checklistsText}
            onChange={(e) => setFormData({ ...formData, checklistsText: e.target.value })}
            helperText="Checklist ini akan dapat dicentang satu per satu oleh mahasiswa."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="Link Berkas Soal / Panduan (Google Drive)"
              placeholder="https://drive.google.com/..."
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
            />
          </div>
          <div>
            <BrutalInput
              label="Link Pengumpulan / Google Classroom"
              placeholder="https://classroom.google.com/..."
              value={formData.submissionLink}
              onChange={(e) => setFormData({ ...formData, submissionLink: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-end gap-3">
          <BrutalButton type="button" variant="outline" onClick={onClose}>
            Batal
          </BrutalButton>
          <BrutalButton type="submit" variant="primary">
            {initialAssignment ? "Simpan Perubahan" : "Publikasikan Tugas"}
          </BrutalButton>
        </div>
      </form>
    </BrutalModal>
  );
};
