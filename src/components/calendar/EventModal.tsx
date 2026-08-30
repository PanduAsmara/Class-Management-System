"use client";

import React, { useState, useEffect } from "react";
import { CalendarEvent, CalendarEventType, Course } from "@/types";
import { BrutalModal } from "../ui/BrutalModal";
import { BrutalInput, BrutalTextarea } from "../ui/BrutalInput";
import { BrutalSelect } from "../ui/BrutalSelect";
import { BrutalButton } from "../ui/BrutalButton";
import { addCalendarEvent, updateCalendarEvent, getCourses } from "@/lib/storage";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: CalendarEvent | null;
  onSaved?: () => void;
}

const EVENT_TYPE_OPTIONS: { label: string; value: CalendarEventType }[] = [
  { label: "Kuliah / Kelas", value: "kuliah" },
  { label: "Ujian Tengah Semester (UTS)", value: "uts" },
  { label: "Ujian Akhir Semester (UAS)", value: "uas" },
  { label: "Deadline Tugas / Proyek", value: "deadline" },
  { label: "Seminar & Workshop", value: "seminar" },
  { label: "Libur Nasional / Cuti", value: "libur" },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  initialEvent,
  onSaved,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    type: CalendarEventType;
    startDate: string;
    endDate: string;
    time: string;
    courseId: string;
    location: string;
    description: string;
  }>({
    title: "",
    type: "kuliah",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    time: "08:00 - 10:30",
    courseId: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    setCourses(getCourses());
    if (initialEvent) {
      setFormData({
        title: initialEvent.title,
        type: initialEvent.type,
        startDate: initialEvent.startDate,
        endDate: initialEvent.endDate,
        time: initialEvent.time || "",
        courseId: initialEvent.courseId || "",
        location: initialEvent.location || "",
        description: initialEvent.description || "",
      });
    } else {
      setFormData({
        title: "",
        type: "kuliah",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        time: "08:00 - 10:30",
        courseId: "",
        location: "Kampus TMJ",
        description: "",
      });
    }
  }, [initialEvent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) {
      alert("Nama acara dan tanggal mulai wajib diisi!");
      return;
    }

    if (initialEvent) {
      updateCalendarEvent(initialEvent.id, {
        title: formData.title,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        time: formData.time,
        courseId: formData.courseId || undefined,
        location: formData.location,
        description: formData.description,
      });
    } else {
      addCalendarEvent({
        title: formData.title,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        time: formData.time,
        courseId: formData.courseId || undefined,
        location: formData.location,
        description: formData.description,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  const courseOptions = [
    { label: "Tidak Ada (Kegiatan Umum / Nasional)", value: "" },
    ...courses.map((c) => ({ label: `${c.code} - ${c.name}`, value: c.id })),
  ];

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialEvent ? "Edit Agenda Kalender" : "Tambah Agenda Kalender"}
      subtitle="Kalender akademik dan agenda kegiatan perkuliahan TMJ"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <BrutalInput
            label="Nama Agenda / Acara *"
            placeholder="Contoh: Ujian Tengah Semester (UTS) Teori"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalSelect
              label="Jenis Acara *"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as CalendarEventType,
                })
              }
              options={EVENT_TYPE_OPTIONS}
            />
          </div>
          <div>
            <BrutalSelect
              label="Terkait Mata Kuliah"
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              options={courseOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="Tanggal Mulai *"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div>
            <BrutalInput
              label="Tanggal Selesai"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="Waktu / Jam"
              placeholder="08:00 - 15:30 WIB"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div>
            <BrutalInput
              label="Lokasi / Ruangan"
              placeholder="Auditorium / Lab Jaringan"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <BrutalTextarea
            label="Keterangan / Deskripsi Agenda"
            placeholder="Detail penjelasan agenda perkuliahan..."
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
            {initialEvent ? "Simpan Perubahan" : "Tambahkan ke Kalender"}
          </BrutalButton>
        </div>
      </form>
    </BrutalModal>
  );
};
