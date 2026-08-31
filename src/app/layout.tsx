import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { PWAInstaller } from "@/components/pwa/PWAInstaller";

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "TMJ Class Management System",
  description: "Pusat Kelola Informasi Perkuliahan Mahasiswa Teknik Multimedia & Jaringan",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TMJ Class",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="application-name" content="TMJ Class" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TMJ Class" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="antialiased font-sans bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <AppShell>
          {children}
          <PWAInstaller />
        </AppShell>
      </body>
    </html>
  );
}
