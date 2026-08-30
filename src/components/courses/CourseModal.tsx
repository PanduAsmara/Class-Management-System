"use client";

import React, { useState, useEffect } from "react";
import { Course } from "@/types";
import { BrutalModal } from "../ui/BrutalModal";
import { BrutalInput, BrutalTextarea } from "../ui/BrutalInput";
import { BrutalSelect } from "../ui/BrutalSelect";
import { BrutalButton } from "../ui/BrutalButton";
import { addCourse, updateCourse } from "@/lib/storage";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: Course | null;
  onSaved?: () => void;
}

const COLOR_OPTIONS = [
  { label: "TMJ Blue (#284C9E)", value: "#284C9E" },
  { label: "TMJ Dark Blue (#203E82)", value: "#203E82" },
  { label: "Yellow Accent (#F7B500)", value: "#F7B500" },
  { label: "Green Accent (#00A86B)", value: "#00A86B" },
  { label: "Red Accent (#E53935)", value: "#E53935" },
  { label: "Purple Accent (#6B21A8)", value: "#6B21A8" },
  { label: "Amber Accent (#D97706)", value: "#D97706" },
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  initialCourse,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    semester: 4,
    sks: 3,
    lecturer: "",
    lecturerNip: "",
    lecturerContact: "",
    color: "#284C9E",
    room: "",
    description: "",
    syllabus: "",
  });

  useEffect(() => {
    if (initialCourse) {
      setFormData({
        name: initialCourse.name,
        code: initialCourse.code,
        semester: initialCourse.semester,
        sks: initialCourse.sks,
        lecturer: initialCourse.lecturer,
        lecturerNip: initialCourse.lecturerNip || "",
        lecturerContact: initialCourse.lecturerContact || "",
        color: initialCourse.color || "#284C9E",
        room: initialCourse.room,
        description: initialCourse.description || "",
        syllabus: initialCourse.syllabus ? initialCourse.syllabus.join("\n") : "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        semester: 4,
        sks: 3,
        lecturer: "",
        lecturerNip: "",
        lecturerContact: "",
        color: "#284C9E",
        room: "",
        description: "",
        syllabus: "",
      });
    }
  }, [initialCourse, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.lecturer) {
      alert("Nama, kode mata kuliah, dan nama dosen wajib diisi!");
      return;
    }

    const syllabusArray = formData.syllabus
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (initialCourse) {
      updateCourse(initialCourse.id, {
        name: formData.name,
        code: formData.code,
        semester: Number(formData.semester),
        sks: Number(formData.sks),
        lecturer: formData.lecturer,
        lecturerNip: formData.lecturerNip,
        lecturerContact: formData.lecturerContact,
        color: formData.color,
        room: formData.room,
        description: formData.description,
        syllabus: syllabusArray,
      });
    } else {
      addCourse({
        name: formData.name,
        code: formData.code,
        semester: Number(formData.semester),
        sks: Number(formData.sks),
        lecturer: formData.lecturer,
        lecturerNip: formData.lecturerNip,
        lecturerContact: formData.lecturerContact,
        color: formData.color,
        room: formData.room,
        description: formData.description,
        syllabus: syllabusArray,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCourse ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
      subtitle="Kelola data silabus dan informasi perkuliahan TMJ"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <BrutalInput
              label="Nama Mata Kuliah *"
              placeholder="Contoh: Pemrograman Web Multimedia"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <BrutalInput
              label="Kode Matkul *"
              placeholder="TMJ205"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <BrutalSelect
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              options={[
                { label: "Semester 1", value: 1 },
                { label: "Semester 2", value: 2 },
                { label: "Semester 3", value: 3 },
                { label: "Semester 4", value: 4 },
                { label: "Semester 5", value: 5 },
                { label: "Semester 6", value: 6 },
                { label: "Semester 7", value: 7 },
                { label: "Semester 8", value: 8 },
              ]}
            />
          </div>
          <div>
            <BrutalSelect
              label="Jumlah SKS"
              value={formData.sks}
              onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
              options={[
                { label: "1 SKS", value: 1 },
                { label: "2 SKS", value: 2 },
                { label: "3 SKS", value: 3 },
                { label: "4 SKS", value: 4 },
                { label: "6 SKS", value: 6 },
              ]}
            />
          </div>
          <div>
            <BrutalSelect
              label="Warna Aksen"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              options={COLOR_OPTIONS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="Dosen Pengampu *"
              placeholder="Dr. Hendra Wijaya, S.T., M.T."
              value={formData.lecturer}
              onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
              required
            />
          </div>
          <div>
            <BrutalInput
              label="Ruangan / Lab"
              placeholder="Lab Multimedia 1 / Gedung D"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="NIP Dosen"
              placeholder="198807252012022003"
              value={formData.lecturerNip}
              onChange={(e) => setFormData({ ...formData, lecturerNip: e.target.value })}
            />
          </div>
          <div>
            <BrutalInput
              label="Kontak / Email Dosen"
              placeholder="dosen@univ.ac.id | 0812-..."
              value={formData.lecturerContact}
              onChange={(e) => setFormData({ ...formData, lecturerContact: e.target.value })}
            />
          </div>
        </div>

        <div>
          <BrutalTextarea
            label="Deskripsi Mata Kuliah"
            placeholder="Ringkasan ruang lingkup mata kuliah dan kompetensi..."
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <BrutalTextarea
            label="Silabus / Pokok Bahasan (Pisahkan per baris)"
            placeholder="Minggu 1: Pendahuluan&#10;Minggu 2: Wireframing&#10;Minggu 3: Prototyping"
            rows={3}
            value={formData.syllabus}
            onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
            helperText="Tulis setiap topik materi per baris."
          />
        </div>

        <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-end gap-3">
          <BrutalButton type="button" variant="outline" onClick={onClose}>
            Batal
          </BrutalButton>
          <BrutalButton type="submit" variant="primary">
            {initialCourse ? "Simpan Perubahan" : "Tambahkan Matkul"}
          </BrutalButton>
        </div>
      </form>
    </BrutalModal>
  );
};
