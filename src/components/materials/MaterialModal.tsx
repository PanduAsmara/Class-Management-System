"use client";

import React, { useState, useEffect } from "react";
import { Material, MaterialAttachmentType, Course } from "@/types";
import { BrutalModal } from "../ui/BrutalModal";
import { BrutalInput, BrutalTextarea } from "../ui/BrutalInput";
import { BrutalSelect } from "../ui/BrutalSelect";
import { BrutalButton } from "../ui/BrutalButton";
import { addMaterial, updateMaterial, getCourses } from "@/lib/storage";

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMaterial?: Material | null;
  onSaved?: () => void;
}

const TYPE_OPTIONS: { label: string; value: MaterialAttachmentType }[] = [
  { label: "PDF Document (.pdf)", value: "pdf" },
  { label: "PowerPoint Presentation (.ppt / .pptx)", value: "ppt" },
  { label: "Word Document (.docx)", value: "docx" },
  { label: "ZIP / RAR Archive (.zip)", value: "zip" },
  { label: "Google Drive Folder / File", value: "gdrive" },
  { label: "YouTube Video Tutorial", value: "youtube" },
];

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  initialMaterial,
  onSaved,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    week: number;
    courseId: string;
    attachmentUrl: string;
    attachmentType: MaterialAttachmentType;
    fileSize: string;
  }>({
    title: "",
    description: "",
    week: 1,
    courseId: "",
    attachmentUrl: "",
    attachmentType: "pdf",
    fileSize: "4.5 MB",
  });

  useEffect(() => {
    const courseList = getCourses();
    setCourses(courseList);
    if (initialMaterial) {
      setFormData({
        title: initialMaterial.title,
        description: initialMaterial.description,
        week: initialMaterial.week,
        courseId: initialMaterial.courseId,
        attachmentUrl: initialMaterial.attachmentUrl,
        attachmentType: initialMaterial.attachmentType,
        fileSize: initialMaterial.fileSize || "File",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        week: 1,
        courseId: courseList[0]?.id || "",
        attachmentUrl: "",
        attachmentType: "pdf",
        fileSize: "3.5 MB",
      });
    }
  }, [initialMaterial, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.attachmentUrl) {
      alert("Judul, mata kuliah, dan URL lampiran wajib diisi!");
      return;
    }

    if (initialMaterial) {
      updateMaterial(initialMaterial.id, {
        title: formData.title,
        description: formData.description,
        week: Number(formData.week),
        courseId: formData.courseId,
        attachmentUrl: formData.attachmentUrl,
        attachmentType: formData.attachmentType,
        fileSize: formData.fileSize,
      });
    } else {
      addMaterial({
        title: formData.title,
        description: formData.description,
        week: Number(formData.week),
        courseId: formData.courseId,
        attachmentUrl: formData.attachmentUrl,
        attachmentType: formData.attachmentType,
        uploadedAt: new Date().toISOString().split("T")[0],
        fileSize: formData.fileSize,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  const courseOptions = courses.map((c) => ({
    label: `${c.code} - ${c.name}`,
    value: c.id,
  }));

  const weekOptions = Array.from({ length: 16 }, (_, i) => ({
    label: `Minggu Ke-${i + 1}`,
    value: i + 1,
  }));

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialMaterial ? "Edit Berkas Materi" : "Unggah Materi Perkuliahan"}
      subtitle="Kelola slide, modul lab, dan referensi belajar TMJ"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <BrutalInput
            label="Judul Materi / Slide *"
            placeholder="Contoh: Modul 03 - Konfigurasi OSPF Multi-Area"
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
            <BrutalSelect
              label="Minggu Pertemuan *"
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: Number(e.target.value) })}
              options={weekOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalSelect
              label="Format / Tipe Lampiran *"
              value={formData.attachmentType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attachmentType: e.target.value as MaterialAttachmentType,
                })
              }
              options={TYPE_OPTIONS}
            />
          </div>
          <div>
            <BrutalInput
              label="Perkiraan Ukuran File"
              placeholder="Contoh: 4.8 MB / Video"
              value={formData.fileSize}
              onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
            />
          </div>
        </div>

        <div>
          <BrutalInput
            label="URL Link Unduh / Google Drive / YouTube *"
            placeholder="https://drive.google.com/file/..."
            value={formData.attachmentUrl}
            onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
            required
          />
        </div>

        <div>
          <BrutalTextarea
            label="Deskripsi / Catatan Tambahan"
            placeholder="Rangkuman pokok materi yang dipelajari pada pertemuan ini..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-end gap-3">
          <BrutalButton type="button" variant="outline" onClick={onClose}>
            Batal
          </BrutalButton>
          <BrutalButton type="submit" variant="primary">
            {initialMaterial ? "Simpan Materi" : "Simpan & Publikasikan"}
          </BrutalButton>
        </div>
      </form>
    </BrutalModal>
  );
};
