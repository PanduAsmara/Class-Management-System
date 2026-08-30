"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Database,
  ShieldAlert,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Server,
  Cloud,
  UploadCloud
} from "lucide-react";
import {
  getCurrentUser,
  getClasses,
  addClass,
  updateClass,
  deleteClass,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  setActiveClassId,
  getActiveClassId,
  getAllCoursesGlobal,
  getSettings,
  uploadLocalDataToCloud,
  subscribeToStore
} from "@/lib/storage";
import { checkSupabaseConnection } from "@/lib/supabase-service";
import { ClassCohort, AuthUser, UserRole } from "@/types";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalModal } from "@/components/ui/BrutalModal";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { BrutalSelect } from "@/components/ui/BrutalSelect";

export default function DeveloperConsolePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [classes, setClasses] = useState<ClassCohort[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [activeTab, setActiveTab] = useState<"classes" | "users" | "system">("classes");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Supabase Live Status
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tableCount: number;
    message: string;
    loading: boolean;
  }>({
    connected: false,
    tableCount: 0,
    message: "Memeriksa koneksi...",
    loading: true,
  });

  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Filter States
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userClassFilter, setUserClassFilter] = useState<string>("all");

  // Class Modal States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassCohort | null>(null);
  const [className, setClassName] = useState("");
  const [classSemester, setClassSemester] = useState(1);
  const [classAcademicYear, setClassAcademicYear] = useState("2025/2026 Genap");
  const [classMajor, setClassMajor] = useState("Teknik Multimedia dan Jaringan");

  // User Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [userUsername, setUserUsername] = useState("");
  const [userName, setUserName] = useState("");
  const [userNim, setUserNim] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("mahasiswa");
  const [userClassId, setUserClassId] = useState("");

  const checkConnection = async () => {
    setSupabaseStatus((prev) => ({ ...prev, loading: true }));
    const res = await checkSupabaseConnection();
    setSupabaseStatus({
      connected: res.connected,
      tableCount: res.tableCount,
      message: res.message,
      loading: false,
    });
  };

  const handleSyncToCloud = async () => {
    setSyncingCloud(true);
    setSyncResult(null);
    const res = await uploadLocalDataToCloud();
    if (res.success) {
      setSyncResult(`Berhasil! ${res.syncedClasses} Kelas dan ${res.syncedUsers} Akun berhasil disinkronkan ke Supabase Cloud.`);
      checkConnection();
    } else {
      setSyncResult(`Gagal sinkronisasi: ${res.error}`);
    }
    setSyncingCloud(false);
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      setIsAuthorized(false);
      router.push("/login");
      return;
    }

    if (user.role !== "developer") {
      setIsAuthorized(false);
      setTimeout(() => {
        router.push("/");
      }, 1500);
      return;
    }

    setIsAuthorized(true);
    setClasses(getClasses());
    setUsers(getAllUsers());
    checkConnection();

    // Auto sync local data to cloud in background if connected
    uploadLocalDataToCloud().catch(console.error);

    const unsubscribe = subscribeToStore(() => {
      setClasses(getClasses());
      setUsers(getAllUsers());
      setCurrentUser(getCurrentUser());
    });
    return () => unsubscribe();
  }, [router]);

  if (isAuthorized === false) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-3xl shadow-card p-8 max-w-md text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-lg text-slate-900">
            Akses Ditolak (403 Forbidden)
          </h2>
          <p className="text-xs text-slate-500">
            Halaman Developer Console hanya dapat diakses oleh akun dengan role <strong>Developer (Superadmin)</strong>. Anda akan dialihkan ke dashboard kelas...
          </p>
          <Link href="/">
            <BrutalButton variant="neutral" size="sm">Kembali ke Dashboard Kelas</BrutalButton>
          </Link>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Memverifikasi hak akses...</div>;
  }

  // Class Actions
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassName("");
    setClassSemester(1);
    setClassAcademicYear("2025/2026 Genap");
    setClassMajor(getSettings().organizationName || "Teknik Multimedia dan Jaringan");
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (c: ClassCohort) => {
    setEditingClass(c);
    setClassName(c.name);
    setClassSemester(c.semester);
    setClassAcademicYear(c.academicYear);
    setClassMajor(c.major);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, {
        name: className,
        semester: Number(classSemester),
        academicYear: classAcademicYear,
        major: classMajor,
      });
    } else {
      addClass({
        name: className,
        semester: Number(classSemester),
        academicYear: classAcademicYear,
        major: classMajor,
      });
    }
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Hapus kelas "${name}"? Seluruh data yang terkait kelas ini akan dihapus.`)) {
      deleteClass(id);
    }
  };

  const handleSwitchToClassDashboard = (classId: string) => {
    setActiveClassId(classId);
    router.push("/");
  };

  // User Actions
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserUsername("");
    setUserName("");
    setUserNim("");
    setUserPassword("mhs123");
    setUserRole("mahasiswa");
    setUserClassId(classes[0]?.id || "");
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: AuthUser) => {
    setEditingUser(u);
    setUserUsername(u.username || "");
    setUserName(u.name);
    setUserNim(u.nim || "");
    setUserPassword(u.password || "");
    setUserRole(u.role);
    setUserClassId(u.classId || "");
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedClass = classes.find((c) => c.id === userClassId);
    const cleanUsername = userUsername.trim().toLowerCase() || userName.toLowerCase().replace(/\s+/g, "");

    if (editingUser) {
      updateUser(editingUser.id, {
        username: cleanUsername,
        name: userName,
        nim: userNim,
        password: userPassword,
        role: userRole,
        classId: userClassId || undefined,
        classGroup: assignedClass?.name,
      });
    } else {
      createUser({
        username: cleanUsername,
        name: userName,
        nim: userNim,
        password: userPassword,
        role: userRole,
        classId: userClassId || undefined,
        classGroup: assignedClass?.name,
      });
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Hapus akun pengguna "${name}"?`)) {
      deleteUser(id);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.nim && u.nim.toLowerCase().includes(userSearchQuery.toLowerCase()));

    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchesClass = userClassFilter === "all" || u.classId === userClassFilter;

    return matchesSearch && matchesRole && matchesClass;
  });

  const allCourses = getAllCoursesGlobal();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-soft-xs">
                <Sparkles className="w-3.5 h-3.5" /> Master Developer Console
              </span>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium">
                {classes.length} Kelas Aktif
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Pusat Kendali Struktur SaaS & Akun
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Kelola kelas dari <strong>Semester 1 s.d. 8</strong>, atur akun Ketua Kelas & Mahasiswa dengan Username/NIM, serta pantau seluruh aktivitas akademik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <BrutalButton variant="neutral" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Lihat Dashboard Kelas
              </BrutalButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-card">
        <button
          onClick={() => setActiveTab("classes")}
          className={`flex-1 py-2 text-xs font-heading font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "classes"
              ? "bg-blue-600 text-white shadow-soft-xs"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4" /> Manajemen Kelas (Semester 1 - 8)
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 text-xs font-heading font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "users"
              ? "bg-blue-600 text-white shadow-soft-xs"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" /> Manajemen Akun & Pengguna
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex-1 py-2 text-xs font-heading font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "system"
              ? "bg-blue-600 text-white shadow-soft-xs"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Database className="w-4 h-4" /> Status Sistem & Supabase
        </button>
      </div>

      {/* 1. MANAJEMEN KELAS (SEMESTERS 1 - 8) */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Daftar Kelas / Rombel Terdaftar
              </h3>
              <p className="text-xs text-slate-500">
                Setiap kelas memiliki dashboard, mata kuliah, dan jadwal yang terisolasi secara rapi.
              </p>
            </div>

            <BrutalButton
              onClick={handleOpenAddClass}
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Kelas Baru
            </BrutalButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const classStudents = users.filter((u) => u.classId === cls.id);
              const classCourses = allCourses.filter((c) => c.classId === cls.id);
              const classLeader = users.find((u) => u.classId === cls.id && u.role === "ketua_kelas");

              return (
                <div
                  key={cls.id}
                  className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-lg text-slate-900">
                        {cls.name}
                      </span>
                      <BrutalBadge variant="primary" size="sm">
                        Semester {cls.semester}
                      </BrutalBadge>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {cls.major} • {cls.academicYear}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="font-heading font-bold text-base text-blue-600">
                          {classStudents.length}
                        </div>
                        <div className="text-[11px] text-slate-500">Mahasiswa</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="font-heading font-bold text-base text-emerald-600">
                          {classCourses.length}
                        </div>
                        <div className="text-[11px] text-slate-500">Mata Kuliah</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 pt-1">
                      <span className="text-slate-400">Ketua Kelas: </span>
                      <strong className="text-slate-800">
                        {classLeader ? classLeader.name : "Belum ditentukan"}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleSwitchToClassDashboard(cls.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      Buka Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MANAJEMEN AKUN & PENGGUNA */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Daftar Pengguna & Hak Akses
              </h3>
              <p className="text-xs text-slate-500">
                Kelola akun Developer, Admin, Ketua Kelas, dan Mahasiswa (Login menggunakan Username / NIM).
              </p>
            </div>

            <BrutalButton
              onClick={handleOpenAddUser}
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Akun Baru
            </BrutalButton>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Cari nama pengguna, username, atau NIM..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none"
              >
                <option value="all">Semua Role</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
                <option value="ketua_kelas">Ketua Kelas</option>
                <option value="mahasiswa">Mahasiswa</option>
              </select>

              <select
                value={userClassFilter}
                onChange={(e) => setUserClassFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
            <table className="minimal-table">
              <thead>
                <tr>
                  <th>Nama Pengguna</th>
                  <th>Username Login</th>
                  <th>NIM</th>
                  <th>Role</th>
                  <th>Penempatan Kelas</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const assignedClass = classes.find((c) => c.id === u.classId);

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="font-semibold text-sm text-slate-900">{u.name}</div>
                      </td>
                      <td className="font-mono text-xs text-blue-700 font-semibold">{u.username || u.name.toLowerCase().replace(/\s+/g, "")}</td>
                      <td className="font-mono text-xs text-slate-600">{u.nim || "-"}</td>
                      <td>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.role === "developer"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : u.role === "admin"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : u.role === "ketua_kelas"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {u.role === "developer"
                            ? "👑 Developer"
                            : u.role === "admin"
                            ? "🛡️ Admin"
                            : u.role === "ketua_kelas"
                            ? "🎓 Ketua Kelas"
                            : "👤 Mahasiswa"}
                        </span>
                      </td>
                      <td>
                        {assignedClass ? (
                          <span className="text-xs font-semibold text-slate-700 px-2 py-0.5 bg-slate-100 rounded-md">
                            {assignedClass.name} (Sem {assignedClass.semester})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Semua / Global</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                            title="Edit Akun"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SISTEM & SUPABASE READINESS */}
      {activeTab === "system" && (
        <div className="space-y-6">
          {/* Sync Button Card */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" /> Sinkronkan Data ke Supabase Cloud
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah seluruh kelas dan akun yang telah dibuat di browser ini agar dapat diakses dari browser lain / perangkat mahasiswa.
                </p>
              </div>

              <BrutalButton
                onClick={handleSyncToCloud}
                variant="primary"
                size="md"
                disabled={syncingCloud}
                icon={<UploadCloud className={`w-4 h-4 ${syncingCloud ? "animate-bounce" : ""}`} />}
              >
                {syncingCloud ? "Menyinkronkan..." : "Unggah Data ke Supabase Cloud"}
              </BrutalButton>
            </div>

            {syncResult && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                  syncResult.includes("Berhasil")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncResult}</span>
              </div>
            )}
          </div>

          {/* Supabase Live Status Card */}
          <BrutalCard
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  <span>Integrasi Supabase Cloud Database & Storage</span>
                </div>
                <button
                  onClick={checkConnection}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.loading ? "animate-spin" : ""}`} /> Periksa Koneksi
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  supabaseStatus.connected
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/70 border-amber-200 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                      supabaseStatus.connected ? "bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" : "bg-amber-500 ring-4 ring-amber-100"
                    }`}
                  />
                  <div>
                    <div className="font-heading font-bold text-sm">
                      {supabaseStatus.connected ? "Supabase Cloud: Terhubung & Aktif" : "Supabase Cloud: Menunggu Kredensial Environment"}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">{supabaseStatus.message}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono px-2.5 py-1 bg-white rounded-xl border font-semibold shadow-soft-xs">
                    {supabaseStatus.connected ? "Real-Time Cloud Mode" : "Local Storage Fallback"}
                  </span>
                </div>
              </div>
            </div>
          </BrutalCard>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-xs">
              <div className="font-heading font-extrabold text-2xl text-blue-600">
                {classes.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Total Kelas</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-xs">
              <div className="font-heading font-extrabold text-2xl text-emerald-600">
                {users.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Total Pengguna</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-xs">
              <div className="font-heading font-extrabold text-2xl text-amber-600">
                {allCourses.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Mata Kuliah Aktif</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-xs">
              <div className="font-heading font-extrabold text-2xl text-purple-600">
                100% Clean
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Zero Dummy Data</div>
            </div>
          </div>
        </div>
      )}

      {/* CLASS MODAL */}
      <BrutalModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? "Edit Kelas / Rombel" : "Tambah Kelas Baru (Semester 1 - 8)"}
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <BrutalInput
            label="Nama Kelas / Rombel *"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. TMJ 1A, TMJ 4B, TMJ 7A"
            required
          />

          <BrutalSelect
            label="Semester (1 - 8) *"
            value={classSemester}
            onChange={(e) => setClassSemester(Number(e.target.value))}
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

          <BrutalInput
            label="Tahun Akademik"
            value={classAcademicYear}
            onChange={(e) => setClassAcademicYear(e.target.value)}
            placeholder="2025/2026 Genap"
          />

          <BrutalInput
            label="Program Studi / Jurusan"
            value={classMajor}
            onChange={(e) => setClassMajor(e.target.value)}
            placeholder="Teknik Multimedia dan Jaringan"
          />

          <div className="pt-2 flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setIsClassModalOpen(false)}
            >
              Batal
            </BrutalButton>
            <BrutalButton type="submit" variant="primary" size="sm">
              {editingClass ? "Simpan Perubahan" : "Buat Kelas"}
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* USER MODAL (Username / NIM) */}
      <BrutalModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? "Edit Akun Pengguna" : "Tambah Akun Baru"}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <BrutalInput
            label="Username Login *"
            value={userUsername}
            onChange={(e) => setUserUsername(e.target.value)}
            placeholder="e.g. pandu / ketua1 / admin"
            required
          />

          <BrutalInput
            label="Nama Lengkap *"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nama pengguna"
            required
          />

          <BrutalInput
            label="NIM (Nomor Induk Mahasiswa)"
            value={userNim}
            onChange={(e) => setUserNim(e.target.value)}
            placeholder="220441100088 (bisa digunakan untuk login)"
          />

          <BrutalInput
            label="Password Akun *"
            type="text"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Password login"
            required
          />

          <BrutalSelect
            label="Role & Hak Akses *"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            options={[
              { label: "👑 Developer (Superadmin Master)", value: "developer" },
              { label: "🛡️ Admin (Pengurus Prodi)", value: "admin" },
              { label: "🎓 Ketua Kelas (Pengelola Kelas)", value: "ketua_kelas" },
              { label: "👤 Mahasiswa (Anggota Kelas)", value: "mahasiswa" },
            ]}
          />

          <BrutalSelect
            label="Penempatan Kelas *"
            value={userClassId}
            onChange={(e) => setUserClassId(e.target.value)}
            options={[
              { label: "Akses Global (Semua Kelas)", value: "" },
              ...classes.map((c) => ({
                label: `${c.name} (Semester ${c.semester})`,
                value: c.id,
              })),
            ]}
          />

          <div className="pt-2 flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setIsUserModalOpen(false)}
            >
              Batal
            </BrutalButton>
            <BrutalButton type="submit" variant="primary" size="sm">
              {editingUser ? "Simpan Akun" : "Buat Akun"}
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>
    </div>
  );
}
