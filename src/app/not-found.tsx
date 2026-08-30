"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { BrutalButton } from "@/components/ui/BrutalButton";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card p-8 max-w-md text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-heading font-extrabold text-xl text-slate-900">
            Halaman Tidak Ditemukan (404)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
          </p>
        </div>
        <Link href="/">
          <BrutalButton variant="primary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Kembali ke Dashboard
          </BrutalButton>
        </Link>
      </div>
    </div>
  );
}
