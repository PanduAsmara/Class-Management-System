import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TMJ Class Management System",
    short_name: "TMJ Class",
    description: "Portal Akademik & Manajemen Perkuliahan Teknik Multimedia dan Jaringan",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#2563EB",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education", "productivity"],
  };
}
