import type { UserProfile } from "@/types/user";

export interface ApiUser {
  id: number | string;
  full_name: string;
  email: string;
  role: "administrator" | "siswa" | "guru";
  email_verified: boolean;
  school_staff?: boolean;
  school_role?: string | null;
  photo_url?: string | null;
}

export type LoginCredentials = { password: string } & (
  | { email: string; nisn?: never }
  | { nisn: string; email?: never }
);

export interface AuthSession {
  user: ApiUser;
  expires_at?: string;
}

export function loginIdentifier(value: string): { email: string } | { nisn: string } | null {
  const identifier = value.trim();
  if (/^\d{10}$/.test(identifier)) return { nisn: identifier };
  if (identifier.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    return { email: identifier };
  }
  return null;
}

export function isApiUser(value: unknown): value is ApiUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (typeof user.id === "number" || typeof user.id === "string")
    && typeof user.full_name === "string" && user.full_name.trim().length > 0
    && typeof user.email === "string"
    && ["administrator", "siswa", "guru"].includes(String(user.role))
    && typeof user.email_verified === "boolean"
    && (user.school_staff === undefined || typeof user.school_staff === "boolean")
    && (user.school_role === undefined || user.school_role === null || typeof user.school_role === "string");
}

export function toUserProfile(user: ApiUser): UserProfile {
  return {
    id: String(user.id), name: user.full_name, email: user.email,
    avatar: "/images/avatar-placeholder.svg",
    role: user.role === "administrator" ? "admin" : user.role,
    backendRole: user.role,
    emailVerified: user.email_verified,
    schoolStaff: user.email_verified && (user.role === "administrator" || (user.role === "guru" && user.school_staff === true)),
    schoolRole: user.school_role ?? null,
  };
}

export function loginDestination(user: UserProfile) {
  if (!user.emailVerified) return "/profile";
  if (user.schoolStaff) return "/admin/alumni-perguruan-tinggi";
  if (user.role === "siswa") return "/siswa/jejak-alumni";
  return "/profile";
}
