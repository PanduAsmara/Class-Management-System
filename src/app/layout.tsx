import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "TMJ Class Management System",
  description: "Pusat Kelola Informasi Perkuliahan Mahasiswa Teknik Multimedia & Jaringan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased font-sans bg-[#F8F9FC] text-[#111111] selection:bg-[#284C9E] selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
