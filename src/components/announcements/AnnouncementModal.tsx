"use client";

import React, { useState, useEffect } from "react";
import { Announcement, AnnouncementCategory, Course } from "@/types";
import { BrutalModal } from "../ui/BrutalModal";
import { BrutalInput, BrutalTextarea } from "../ui/BrutalInput";
import { BrutalSelect } from "../ui/BrutalSelect";
import { BrutalButton } from "../ui/BrutalButton";
import { addAnnouncement, updateAnnouncement, getCourses } from "@/lib/storage";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAnnouncement?: Announcement | null;
  onSaved?: () => void;
}

const CATEGORY_OPTIONS: { label: string; value: AnnouncementCategory }[] = [
  { label: "Info (Umum)", value: "info" },
  { label: "Reminder (Pengingat)", value: "reminder" },
  { label: "Important (Penting)", value: "important" },
  { label: "Urgent (Mendesak / Darurat)", value: "urgent" },
];

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  initialAnnouncement,
  onSaved,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: AnnouncementCategory;
    targetCourseId: string;
    author: string;
    pinned: boolean;
    attachmentName: string;
    attachmentUrl: string;
  }>({
    title: "",
    content: "",
    category: "info",
    targetCourseId: "",
    author: "Pengurus TMJ",
    pinned: false,
    attachmentName: "",
    attachmentUrl: "",
  });

  useEffect(() => {
    setCourses(getCourses());
    if (initialAnnouncement) {
      setFormData({
        title: initialAnnouncement.title,
        content: initialAnnouncement.content,
        category: initialAnnouncement.category,
        targetCourseId: initialAnnouncement.targetCourseId || "",
        author: initialAnnouncement.author,
        pinned: !!initialAnnouncement.pinned,
        attachmentName: initialAnnouncement.attachments?.[0]?.name || "",
        attachmentUrl: initialAnnouncement.attachments?.[0]?.url || "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        category: "info",
        targetCourseId: "",
        author: "Pengurus TMJ",
        pinned: false,
        attachmentName: "",
        attachmentUrl: "",
      });
    }
  }, [initialAnnouncement, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Judul dan isi pengumuman wajib diisi!");
      return;
    }

    const attachments =
      formData.attachmentName && formData.attachmentUrl
        ? [{ name: formData.attachmentName, url: formData.attachmentUrl }]
        : [];

    if (initialAnnouncement) {
      updateAnnouncement(initialAnnouncement.id, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        targetCourseId: formData.targetCourseId || undefined,
        author: formData.author,
        pinned: formData.pinned,
        attachments,
      });
    } else {
      addAnnouncement({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        date: new Date().toISOString().split("T")[0],
        targetCourseId: formData.targetCourseId || undefined,
        author: formData.author,
        pinned: formData.pinned,
        attachments,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  const courseOptions = [
    { label: "Semua Mata Kuliah (Umum / Kelas)", value: "" },
    ...courses.map((c) => ({ label: `${c.code} - ${c.name}`, value: c.id })),
  ];

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAnnouncement ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
      subtitle="Siarkan informasi perkuliahan ke seluruh mahasiswa TMJ"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <BrutalInput
            label="Judul Pengumuman *"
            placeholder="Contoh: Perubahan Ruang Praktikum Jarkom"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalSelect
              label="Kategori *"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as AnnouncementCategory,
                })
              }
              options={CATEGORY_OPTIONS}
            />
          </div>
          <div>
            <BrutalSelect
              label="Target Mata Kuliah"
              value={formData.targetCourseId}
              onChange={(e) => setFormData({ ...formData, targetCourseId: e.target.value })}
              options={courseOptions}
            />
          </div>
        </div>

        <div>
          <BrutalTextarea
            label="Isi Pengumuman *"
            placeholder="Tuliskan isi pengumuman secara detail..."
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="Nama Berkas / Lampiran (Opsional)"
              placeholder="Modul_Praktikum.pdf"
              value={formData.attachmentName}
              onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
            />
          </div>
          <div>
            <BrutalInput
              label="Tautan Berkas / Google Drive"
              placeholder="https://drive.google.com/file/..."
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <BrutalInput
              label="Nama Pengirim / Pembuat"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="pinnedCheck"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="brutal-check"
            />
            <label htmlFor="pinnedCheck" className="text-xs font-mono font-bold text-[#111111] cursor-pointer select-none">
              Sematkan di Atas (Pin Urgent)
            </label>
          </div>
        </div>

        <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-end gap-3">
          <BrutalButton type="button" variant="outline" onClick={onClose}>
            Batal
          </BrutalButton>
          <BrutalButton type="submit" variant="primary">
            {initialAnnouncement ? "Simpan Pengumuman" : "Publikasikan Pengumuman"}
          </BrutalButton>
        </div>
      </form>
    </BrutalModal>
  );
};
