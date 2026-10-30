"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "@/types/user";

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
    login: (preset?: PresetKey) => void;
    logout: () => void;
    switchRole: (preset: PresetKey) => void;
    getDisplayRole: () => DisplayRoleInfo;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [currentPreset, setCurrentPreset] = useState<PresetKey>("siswa_aktif");
    const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.siswa_aktif);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const savedAuth = localStorage.getItem("eightracer_is_logged_in");
                if (savedAuth === "true") {
                    setIsLoggedIn(true);
                } else if (savedAuth === "false") {
                    setIsLoggedIn(false);
                }

                const saved = localStorage.getItem("eightracer_user_role_preset") as PresetKey | null;
                if (saved && MOCK_USERS[saved]) {
                    setCurrentPreset(saved);
                    setCurrentUser(MOCK_USERS[saved]);
                }
            } catch {
                // Fallback if localStorage is inaccessible
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const login = (preset?: PresetKey) => {
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

    const logout = () => {
        setIsLoggedIn(false);
        try {
            localStorage.setItem("eightracer_is_logged_in", "false");
        } catch {
            // Ignore
        }
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
                logout,
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
    if (!context) {
        return {
            currentUser: MOCK_USERS.siswa_aktif,
            currentPreset: "siswa_aktif" as PresetKey,
            isLoggedIn: false,
            login: () => {},
            logout: () => {},
            switchRole: () => {},
            getDisplayRole: () => ({
                label: "Siswa",
                badgeColor: "bg-purple-500/10 text-purple-700 border-purple-200",
                dotColor: "bg-purple-500",
                roleType: "siswa" as const,
            }),
        };
    }
    return context;
}
