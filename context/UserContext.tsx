"use client";

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "@/types/user";
import { api, getToken, setToken } from "@/lib/api";

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

/** Bentuk user yang dikembalikan backend Laravel (POST /login & GET /me). */
export interface AuthUser {
    id: number;
    username: string;
    role: "administrator" | "guru" | "siswa";
    nama_lengkap: string;
    profil: {
        id?: number | null;
        nip?: string | null;
        nisn?: string | null;
        nis?: string | null;
        nama_lengkap?: string;
        nama_panggilan?: string | null;
        jabatan?: string | null;
        inisial?: string | null;
        foto_profil_url?: string | null;
        email?: string | null;
        kelas?: string | null;
        tingkat_kelas?: string | null;
        tahun_ajaran?: string | null;
        apakah_wali_kelas?: boolean;
        sub_peran?: "wali_kelas" | "guru_bk";
        kelas_binaan?: { id: number; nama_kelas: string; tingkat: string; tahun_ajaran: string } | null;
    } | null;
}

/** Halaman tujuan setelah login (modul B1) berdasarkan role/sub-peran backend. */
export function getHomeRoute(user: AuthUser | null): string {
    if (!user) return "/login";
    if (user.role === "siswa") return "/siswa/b-1";
    if (user.role === "guru") {
        return user.profil?.sub_peran === "guru_bk" ? "/admin/b-1" : "/guru/b-1";
    }
    return "/admin/b-1";
}

function avatarDataUri(initials: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#EDE0FF"/><text x="50%" y="54%" font-family="sans-serif" font-size="38" font-weight="700" fill="#5F089E" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function toUserProfile(user: AuthUser): UserProfile {
    const p = user.profil ?? {};
    const initials = (p.inisial || user.nama_lengkap?.slice(0, 2) || "US").toUpperCase();
    const avatar = p.foto_profil_url || avatarDataUri(initials);
    const base = { id: `api-${user.id}`, name: user.nama_lengkap || user.username, avatar };

    if (user.role === "siswa") {
        return {
            ...base,
            email: p.email || "",
            role: "siswa",
            statusSiswa: "aktif",
            nisn: p.nisn || undefined,
            kelas: p.kelas || undefined,
        };
    }
    if (user.role === "guru") {
        return {
            ...base,
            email: "",
            role: "guru",
            nip: p.nip || undefined,
            waliKelas: p.kelas_binaan?.nama_kelas,
        };
    }
    return {
        ...base,
        email: "",
        role: "admin",
        adminLevel: "Administrator",
    };
}

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
    login: ((username: string, password: string) => Promise<AuthUser>) & ((preset?: PresetKey) => void);
    loginAsPreset: (preset?: PresetKey) => void;
    logout: () => void;
    switchRole: (preset: PresetKey) => void;
    getDisplayRole: () => DisplayRoleInfo;
    /** Pengguna asli dari backend (null jika belum login via API). */
    authUser: AuthUser | null;
    /** true setelah pemeriksaan sesi awal (token tersimpan) selesai. */
    authReady: boolean;
    /** Login sungguhan ke backend. Melempar ApiError bila gagal. */
    signIn: (username: string, password: string) => Promise<AuthUser>;
    /** Logout sungguhan (mencabut token di backend). */
    signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function presetForAuthUser(user: AuthUser): PresetKey {
    if (user.role === "administrator") return "admin";
    if (user.role === "guru") return "guru";
    return "siswa_aktif";
}

const SESSION_EXPIRY_HOURS = 12;
const SESSION_EXPIRY_MS = SESSION_EXPIRY_HOURS * 60 * 60 * 1000; // 12 Jam
const AUTH_USER_KEY = "eightracer_auth_user";
const SESSION_EXPIRES_AT_KEY = "eightracer_session_expires_at";
const IS_LOGGED_IN_KEY = "eightracer_is_logged_in";
const ROLE_PRESET_KEY = "eightracer_user_role_preset";

export function UserProvider({ children }: { children: ReactNode }) {
    const [currentPreset, setCurrentPreset] = useState<PresetKey>("siswa_aktif");
    const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.siswa_aktif);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [authReady, setAuthReady] = useState<boolean>(false);

    const applyAuthUser = useCallback((user: AuthUser, refreshExpiry = false) => {
        setAuthUser(user);
        setCurrentPreset(presetForAuthUser(user));
        setCurrentUser(toUserProfile(user));
        setIsLoggedIn(true);
        try {
            localStorage.setItem(IS_LOGGED_IN_KEY, "true");
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
            localStorage.setItem(ROLE_PRESET_KEY, presetForAuthUser(user));
            if (refreshExpiry || !localStorage.getItem(SESSION_EXPIRES_AT_KEY)) {
                localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(Date.now() + SESSION_EXPIRY_MS));
            }
        } catch {
            // Ignore
        }
    }, []);

    const clearAuth = useCallback(() => {
        setToken(null);
        setAuthUser(null);
        setIsLoggedIn(false);
        try {
            localStorage.setItem(IS_LOGGED_IN_KEY, "false");
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
            localStorage.removeItem(ROLE_PRESET_KEY);
        } catch {
            // Ignore
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        // 1. Periksa masa kedaluwarsa sesi terlebih dahulu
        try {
            const expiresAtStr = localStorage.getItem(SESSION_EXPIRES_AT_KEY);
            if (expiresAtStr) {
                const expiresAt = Number(expiresAtStr);
                if (Date.now() > expiresAt) {
                    // Sesi telah kedaluwarsa setelah durasi yang ditentukan (12 jam)
                    clearAuth();
                    setAuthReady(true);
                    return;
                }
            }

            // 2. Pulihkan sesi pengguna secara sinkron dari localStorage agar tidak terlogout saat refresh
            const savedUserStr = localStorage.getItem(AUTH_USER_KEY);
            const token = getToken();

            if (savedUserStr && token) {
                const parsedUser: AuthUser = JSON.parse(savedUserStr);
                setAuthUser(parsedUser);
                setCurrentPreset(presetForAuthUser(parsedUser));
                setCurrentUser(toUserProfile(parsedUser));
                setIsLoggedIn(true);
            } else {
                const savedAuth = localStorage.getItem(IS_LOGGED_IN_KEY);
                if (savedAuth === "true") {
                    setIsLoggedIn(true);
                }
                const saved = localStorage.getItem(ROLE_PRESET_KEY) as PresetKey | null;
                if (saved && MOCK_USERS[saved]) {
                    setCurrentPreset(saved);
                    setCurrentUser(MOCK_USERS[saved]);
                }
            }
        } catch {
            // Fallback jika localStorage tidak dapat diakses
        }

        setAuthReady(true);

        // 3. Verifikasi latar belakang ke backend endpoint /me
        // Sesi HANYA dihapus jika backend memberikan 401 Unauthorized secara eksplisit.
        // Jika ada kendala jaringan atau server sesaat, sesi lokal tetap dipertahankan.
        if (getToken()) {
            api.get<{ user: AuthUser }>("/me")
                .then((res) => {
                    if (!cancelled) {
                        applyAuthUser(res.user, false);
                    }
                })
                .catch((err: any) => {
                    if (err?.status === 401 && !cancelled) {
                        clearAuth();
                    }
                });
        }

        // 4. Timer background pengecekan sesi berkala
        const intervalId = setInterval(() => {
            try {
                const expiresAtStr = localStorage.getItem(SESSION_EXPIRES_AT_KEY);
                if (expiresAtStr && Date.now() > Number(expiresAtStr)) {
                    clearAuth();
                }
            } catch {
                // Ignore
            }
        }, 60000);

        const onUnauthorized = () => clearAuth();
        window.addEventListener("eightracer:unauthorized", onUnauthorized);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            window.removeEventListener("eightracer:unauthorized", onUnauthorized);
        };
    }, [applyAuthUser, clearAuth]);

    const signIn = async (username: string, password: string): Promise<AuthUser> => {
        const res = await api.post<{ user: AuthUser; token: string }>("/login", {
            username: username.trim(),
            password,
        });
        setToken(res.token);
        applyAuthUser(res.user, true);
        return res.user;
    };

    const signOut = async (): Promise<void> => {
        try {
            if (getToken()) await api.post("/logout");
        } catch {
            // Token mungkin sudah kedaluwarsa; tetap bersihkan sesi lokal
        }
        clearAuth();
    };

    const loginAsPreset = (preset?: PresetKey) => {
        setIsLoggedIn(true);
        if (preset && MOCK_USERS[preset]) {
            setCurrentPreset(preset);
            setCurrentUser(MOCK_USERS[preset]);
        }
        try {
            localStorage.setItem("eightracer_is_logged_in", "true");
        } catch {
            // Ignore
        }
    };

    const login = (async (
        usernameOrPreset?: string | PresetKey,
        password?: string
    ) => {
        if (typeof password === "string" && typeof usernameOrPreset === "string") {
            return await signIn(usernameOrPreset, password);
        }
        loginAsPreset(usernameOrPreset as PresetKey);
    }) as ((username: string, password: string) => Promise<AuthUser>) & ((preset?: PresetKey) => void);

    const logout = () => {
        // Cabut token backend (jika ada) lalu bersihkan sesi lokal
        if (getToken()) {
            void api.post("/logout").catch(() => undefined);
        }
        clearAuth();
    };

    const switchRole = (preset: PresetKey) => {
        setCurrentPreset(preset);
        setCurrentUser(MOCK_USERS[preset]);
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
                label: "Guru / Wali Kelas",
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
                login,
                loginAsPreset,
                logout,
                switchRole,
                getDisplayRole,
                authUser,
                authReady,
                signIn,
                signOut,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (!context) {
        return {
            currentUser: MOCK_USERS.siswa_aktif,
            currentPreset: "siswa_aktif" as PresetKey,
            isLoggedIn: false,
            login: ((async () => ({} as AuthUser)) as any),
            loginAsPreset: () => {},
            logout: () => {},
            switchRole: () => {},
            getDisplayRole: () => ({
                label: "Siswa",
                badgeColor: "bg-purple-500/10 text-purple-700 border-purple-200",
                dotColor: "bg-purple-500",
                roleType: "siswa" as const,
            }),
            authUser: null,
            authReady: false,
            signIn: async () => {
                throw new Error("UserProvider belum terpasang.");
            },
            signOut: async () => {},
        };
    }
    return context;
}
