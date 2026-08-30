"use client";

import React, { useState, useEffect } from "react";
import { Schedule, Course, DayOfWeek } from "@/types";
import { BrutalModal } from "../ui/BrutalModal";
import { BrutalInput } from "../ui/BrutalInput";
import { BrutalSelect } from "../ui/BrutalSelect";
import { BrutalButton } from "../ui/BrutalButton";
import { addSchedule, updateSchedule, getCourses } from "@/lib/storage";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSchedule?: Schedule | null;
  onSaved?: () => void;
}

const DAYS_OPTIONS: { label: string; value: DayOfWeek }[] = [
  { label: "Senin", value: "Senin" },
  { label: "Selasa", value: "Selasa" },
  { label: "Rabu", value: "Rabu" },
  { label: "Kamis", value: "Kamis" },
  { label: "Jumat", value: "Jumat" },
  { label: "Sabtu", value: "Sabtu" },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  initialSchedule,
  onSaved,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<{
    courseId: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    room: string;
    lecturer: string;
    meetingLink: string;
    type: "Teori" | "Praktikum" | "Respons";
  }>({
    courseId: "",
    day: "Senin",
    startTime: "08:00",
    endTime: "10:30",
    room: "",
    lecturer: "",
    meetingLink: "",
    type: "Praktikum",
  });

  useEffect(() => {
    const list = getCourses();
    setCourses(list);
    if (initialSchedule) {
      setFormData({
        courseId: initialSchedule.courseId,
        day: initialSchedule.day,
        startTime: initialSchedule.startTime,
        endTime: initialSchedule.endTime,
        room: initialSchedule.room,
        lecturer: initialSchedule.lecturer,
        meetingLink: initialSchedule.meetingLink || "",
        type: initialSchedule.type || "Praktikum",
      });
    } else {
      const defaultCourse = list[0];
      setFormData({
        courseId: defaultCourse?.id || "",
        day: "Senin",
        startTime: "08:00",
        endTime: "10:30",
        room: defaultCourse?.room || "Lab Multimedia 1",
        lecturer: defaultCourse?.lecturer || "",
        meetingLink: "",
        type: "Praktikum",
      });
    }
  }, [initialSchedule, isOpen]);

  const handleCourseChange = (selectedCourseId: string) => {
    const selected = courses.find((c) => c.id === selectedCourseId);
    setFormData((prev) => ({
      ...prev,
      courseId: selectedCourseId,
      room: selected ? selected.room : prev.room,
      lecturer: selected ? selected.lecturer : prev.lecturer,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.startTime || !formData.endTime || !formData.room) {
      alert("Mata kuliah, hari, jam, dan ruangan wajib diisi!");
      return;
    }

    if (initialSchedule) {
      updateSchedule(initialSchedule.id, formData);
    } else {
      addSchedule(formData);
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
      title={initialSchedule ? "Edit Jadwal Kuliah" : "Tambah Sesi Jadwal Baru"}
      subtitle="Kelola slot waktu perkuliahan TMJ"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <BrutalSelect
            label="Pilih Mata Kuliah *"
            value={formData.courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            options={courseOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalSelect
              label="Hari *"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
              options={DAYS_OPTIONS}
            />
          </div>
          <div>
            <BrutalSelect
              label="Jenis Perkuliahan"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "Teori" | "Praktikum" | "Respons",
                })
              }
              options={[
                { label: "Praktikum Lab", value: "Praktikum" },
                { label: "Teori Kelas", value: "Teori" },
                { label: "Responsi / Asistensi", value: "Respons" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="Jam Mulai *"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
          <div>
            <BrutalInput
              label="Jam Selesai *"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BrutalInput
              label="Ruangan / Lab *"
              placeholder="Contoh: Lab Jaringan 2"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              required
            />
          </div>
          <div>
            <BrutalInput
              label="Dosen / Asisten"
              placeholder="Ir. Bambang Haryadi, M.Kom."
              value={formData.lecturer}
              onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
            />
          </div>
        </div>

        <div>
          <BrutalInput
            label="Link Meeting Online (Google Meet / Zoom)"
            placeholder="https://meet.google.com/..."
            value={formData.meetingLink}
            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
          />
        </div>

        <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-end gap-3">
          <BrutalButton type="button" variant="outline" onClick={onClose}>
            Batal
          </BrutalButton>
          <BrutalButton type="submit" variant="primary">
            {initialSchedule ? "Simpan Perubahan" : "Tambahkan Jadwal"}
          </BrutalButton>
        </div>
      </form>
    </BrutalModal>
  );
};
