"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  Menu, 
  CheckCheck,
  ExternalLink,
  LogOut,
  Settings,
  ChevronDown,
  Building2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  User as UserIcon
} from "lucide-react";
import { 
  getUserRole, 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToStore,
  getProfile,
  getCurrentUser,
  getClasses,
  getActiveClassId,
  setActiveClassId,
  getActiveClass,
  logout
} from "@/lib/storage";
import { UserRole, NotificationItem, AuthUser, ClassCohort } from "@/types";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenSearch }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [classes, setClasses] = useState<ClassCohort[]>([]);
  const [activeClass, setActiveClass] = useState<ClassCohort | undefined>(undefined);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showClassMenu, setShowClassMenu] = useState(false);
  const [profile, setProfile] = useState(getProfile());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());
    setClasses(getClasses());
    setActiveClass(getActiveClass());
    setNotifications(getNotifications());
    setProfile(getProfile());

    const unsubscribe = subscribeToStore(() => {
      setCurrentUser(getCurrentUser());
      setClasses(getClasses());
      setActiveClass(getActiveClass());
      setNotifications(getNotifications());
      setProfile(getProfile());
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSelectClass = (classId: string) => {
    setActiveClassId(classId);
    setShowClassMenu(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) return null;

  const role = currentUser?.role || "mahasiswa";
  const isDevOrAdmin = role === "developer" || role === "admin";

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search Pill */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Pill */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/70 hover:bg-slate-100 border border-slate-200/70 rounded-full transition-all duration-150 group"
        >
          <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-700">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            Cari matkul, jadwal, materi, tugas...
          </span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white border border-slate-200 text-[10px] rounded-md font-mono text-slate-400 font-medium shadow-soft-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Class Switcher, Notifications, Role Badge & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Class Switcher (for Developer & Admin) */}
        {classes.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                if (isDevOrAdmin) {
                  setShowClassMenu(!showClassMenu);
                  setShowProfileMenu(false);
                  setShowNotifPopover(false);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-all ${
                isDevOrAdmin
                  ? "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 cursor-pointer"
                  : "bg-slate-50 text-slate-700 border-slate-200 cursor-default"
              }`}
              title={isDevOrAdmin ? "Ganti Kelas / Semester" : "Kelas Terdaftar"}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeClass ? `${activeClass.name} (Sem ${activeClass.semester})` : "Pilih Kelas"}</span>
              {isDevOrAdmin && <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>

            {/* Class Dropdown */}
            {showClassMenu && isDevOrAdmin && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-soft-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Pilih Kelas Aktif (Sem 1 - 8)
                </div>
                <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => handleSelectClass(cls.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        activeClass?.id === cls.id
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{cls.name}</span>
                      <span className="text-[11px] font-mono font-normal text-slate-400">
                        Semester {cls.semester}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Role Pill */}
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-heading font-semibold border ${
            role === "developer"
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : role === "admin"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : role === "ketua_kelas"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {role === "developer" ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Developer</span>
            </>
          ) : role === "admin" ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin</span>
            </>
          ) : role === "ketua_kelas" ? (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>Ketua Kelas</span>
            </>
          ) : (
            <>
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mahasiswa</span>
            </>
          )}
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifPopover(!showNotifPopover);
              setShowProfileMenu(false);
              setShowClassMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-soft-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-heading font-semibold text-xs text-slate-800">
                  Notifikasi ({unreadCount} baru)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] font-sans text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Tandai Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                        !n.isRead ? "bg-blue-50/40" : "text-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifPopover(false);
              setShowClassMenu(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-heading font-bold text-xs flex items-center justify-center shadow-soft-xs">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "DV"}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-heading font-semibold text-xs text-slate-800 leading-none">
                {currentUser?.name || "Developer"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5 capitalize">
                {role.replace("_", " ")}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-soft-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-800">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
              </div>

              <div className="py-1">
                {role === "developer" && (
                  <Link
                    href="/developer"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-purple-700 bg-purple-50/60 font-semibold hover:bg-purple-50 transition-colors mb-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Developer Console</span>
                  </Link>
                )}

                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pengaturan Profil</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
