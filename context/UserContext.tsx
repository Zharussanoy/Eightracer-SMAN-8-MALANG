"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { UserProfile } from "@/types/user";
import { api, ApiError } from "@/lib/eightracer-api";
import { toUserProfile, type LoginCredentials } from "@/lib/auth";
import { useRouter } from "next/navigation";

export const MOCK_USERS: Record<string, UserProfile> = {
    siswa_aktif: {
        id: "user-1",
        name: "Ahmad Faiz Pratama",
        email: "faiz.siswa@sman8malang.sch.id",
        avatar: "/team/b3-ismail.png",
        role: "siswa",
        statusSiswa: "aktif",
        nisn: "0058291032",
        kelas: "XII MIPA 3",
        nilaiRataRata: 92.4,
        targetPtn: "Institut Teknologi Bandung",
        targetProdi: "Teknik Informatika",
        targetPtnAlt: "Universitas Brawijaya",
        targetProdiAlt: "Sistem Informasi",
        jalurTarget: "SNBP",
    },
    siswa_alumni: {
        id: "user-2",
        name: "Nabila Azzahra, S.Kom",
        email: "nabila.alumni@alumni.sman8malang.sch.id",
        avatar: "/team/b1-naysilla.png",
        role: "siswa",
        statusSiswa: "lulus",
        tahunLulus: 2022,
        angkatan: "Alumni 2022",
        nisn: "0038910291",
        ptnKampus: "Universitas Brawijaya",
        prodiKampus: "Teknik Informatika",
        jalurDiterima: "SNBP (Jalur Prestasi)",
        pekerjaan: "Software Engineer di Tech Unicorn Jakarta",
        linkedinUrl: "https://linkedin.com",
    },
    guru: {
        id: "user-3",
        name: "Drs. Bambang Hidayat, M.Pd",
        email: "bambang.guru@sman8malang.sch.id",
        avatar: "/team/b2-yan-hasby.png",
        role: "guru",
        nip: "19750812 200212 1 003",
        mataPelajaran: "Matematika Peminatan",
        waliKelas: "XII MIPA 3",
        totalSiswaBinaan: 36,
    },
    admin: {
        id: "user-4",
        name: "Admin Smarihasta (Superadmin)",
        email: "superadmin@sman8malang.sch.id",
        avatar: "/team/b3-hafiidz.png",
        role: "admin",
        adminLevel: "Super Administrator - Tim B3",
    },
};

export type PresetKey = "siswa_aktif" | "siswa_alumni" | "guru" | "admin";

interface DisplayRoleInfo {
    label: string;
    badgeColor: string;
    dotColor: string;
    roleType: "siswa" | "alumni" | "guru" | "admin";
}

interface UserContextType {
    currentUser: UserProfile;
    currentPreset: PresetKey;
    isLoggedIn: boolean;
    authStatus: "loading" | "authenticated" | "anonymous" | "unavailable";
    authMessage: string;
    login: (credentials: LoginCredentials) => Promise<UserProfile>;
    logout: () => Promise<boolean>;
    refreshSession: () => Promise<void>;
    switchRole: (preset: PresetKey) => void;
    getDisplayRole: () => DisplayRoleInfo;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [demoPreset, setDemoPreset] = useState<PresetKey>("siswa_aktif");
    const [sessionUser, setSessionUser] = useState<UserProfile | null>(null);
    const [authStatus, setAuthStatus] = useState<UserContextType["authStatus"]>("loading");
    const [authMessage, setAuthMessage] = useState("");
    const generation = useRef(0);
    const mutating = useRef(false);
    const knownSession = useRef(false);
    const router = useRouter();
    const isLoggedIn = authStatus === "authenticated" && sessionUser !== null;
    const currentUser = sessionUser ?? MOCK_USERS[demoPreset];
    const currentPreset: PresetKey = sessionUser
        ? sessionUser.role === "admin" ? "admin" : sessionUser.role === "guru" ? "guru" : "siswa_aktif"
        : demoPreset;

    const refreshSession = useCallback(async (signal?: AbortSignal) => {
        if (mutating.current) return;
        const version = ++generation.current;
        try {
            const result = await api.me(signal);
            if (signal?.aborted || version !== generation.current) return;
            knownSession.current = true;
            setSessionUser(toUserProfile(result.user));
            setAuthStatus("authenticated");
            setAuthMessage("");
        } catch (error) {
            if (signal?.aborted || version !== generation.current) return;
            if (error instanceof ApiError && error.status === 401) {
                const expired = knownSession.current || error.sessionExpired;
                knownSession.current = false;
                setSessionUser(null);
                setAuthStatus("anonymous");
                setAuthMessage(expired ? "Sesi telah berakhir. Silakan masuk lagi." : "");
                if (expired) router.replace("/login");
            } else {
                setAuthStatus("unavailable");
                setAuthMessage(error instanceof Error ? error.message : "Sesi belum dapat diperiksa. Coba lagi.");
            }
        }
    }, [router]);

    useEffect(() => {
        const controller = new AbortController();
        async function restore() {
            try {
                localStorage.removeItem("eightracer_is_logged_in");
                const saved = localStorage.getItem("eightracer_user_role_preset") as PresetKey | null;
                if (saved && MOCK_USERS[saved]) setDemoPreset(saved);
            } catch { /* Pilihan demo tidak wajib tersimpan. */ }
            await refreshSession(controller.signal);
        }
        void restore();
        return () => controller.abort();
    }, [refreshSession]);

    useEffect(() => {
        const check = () => { if (document.visibilityState === "visible") void refreshSession(); };
        window.addEventListener("focus", check);
        document.addEventListener("visibilitychange", check);
        return () => { window.removeEventListener("focus", check); document.removeEventListener("visibilitychange", check); };
    }, [refreshSession]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        mutating.current = true;
        generation.current++;
        try {
            const result = await api.login(credentials);
            const profile = toUserProfile(result.user);
            knownSession.current = true;
            setSessionUser(profile);
            setAuthStatus("authenticated");
            setAuthMessage("");
            return profile;
        } finally { mutating.current = false; }
    }, []);

    const logout = useCallback(async () => {
        mutating.current = true;
        generation.current++;
        try {
            await api.logout();
            knownSession.current = false;
            setAuthMessage("");
            setSessionUser(null);
            setAuthStatus("anonymous");
            return true;
        } catch (error) {
            setAuthMessage(error instanceof Error ? error.message : "Keluar dari akun belum berhasil. Periksa koneksi.");
            if (error instanceof ApiError && error.localSessionCleared) {
                knownSession.current = false;
                setSessionUser(null);
                setAuthStatus("anonymous");
                return true;
            }
            return false;
        } finally {
            mutating.current = false;
        }
    }, []);

    const switchRole = (preset: PresetKey) => {
        if (authStatus !== "anonymous") return;
        setDemoPreset(preset);
        try {
            localStorage.setItem("eightracer_user_role_preset", preset);
        } catch {
            // Ignore
        }
    };

    const getDisplayRole = (): DisplayRoleInfo => {
        if (currentUser.role === "admin") {
            return {
                label: "Admin",
                badgeColor: "bg-red-500/10 text-red-600 border-red-200",
                dotColor: "bg-red-500",
                roleType: "admin",
            };
        }
        if (currentUser.role === "guru") {
            return {
                label: currentUser.schoolStaff ? "Guru BK" : "Guru / Wali Kelas",
                badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
                dotColor: "bg-blue-500",
                roleType: "guru",
            };
        }
        if (currentUser.role === "siswa") {
            if (currentUser.statusSiswa === "lulus") {
                return {
                    label: "Alumni",
                    badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                    dotColor: "bg-emerald-500",
                    roleType: "alumni",
                };
            }
            return {
                label: "Siswa",
                badgeColor: "bg-purple-500/10 text-purple-700 border-purple-200",
                dotColor: "bg-purple-500",
                roleType: "siswa",
            };
        }
        return {
            label: "Pengguna",
            badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
            dotColor: "bg-slate-500",
            roleType: "siswa",
        };
    };

    return (
        <UserContext.Provider
            value={{
                currentUser,
                currentPreset,
                isLoggedIn,
                authStatus,
                authMessage,
                login,
                logout,
                refreshSession,
                switchRole,
                getDisplayRole,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser harus berada di dalam UserProvider.");
    return context;
}
