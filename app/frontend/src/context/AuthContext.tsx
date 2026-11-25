import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { User, UserRole } from "../types";
import { request } from "../services/apiClient";

interface Session { user: User; token: string | null }
interface AuthContextValue {
  user: User | null;
  token: string | null;
  loginApi: (email: string, password: string) => Promise<User>;
  replaceToken: (token: string) => void;
  updateProfile: (userId: number, profile: { fullName: string | null; phone: string | null; avatarUrl?: string | null }) => void;
  logout: () => void;
}
const STORAGE_KEY = "ecw_auth_user";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
function readSession(): Session | null {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!value) return null;
    const user = value.user ?? value;
    if (!["admin", "teacher", "student"].includes(user.role) || typeof user.email !== "string") return null;
    if (typeof value.token !== "string" || !value.token || value.token === "local-admin-mock-preview") { localStorage.removeItem(STORAGE_KEY); return null; }
    return { user, token: value.token };
  } catch { return null; }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);
  const save = useCallback((next: Session) => {
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);
  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  async function loginApi(email: string, password: string) {
    const result = await request<{ token: string; userId: number; email: string; role: UserRole }>("/api/auth/login", null,
      { method: "POST", body: JSON.stringify({ email, password }) });
    if (!["admin", "teacher", "student"].includes(result.role) || !result.token) throw new Error("Thông tin đăng nhập không hợp lệ.");
    const user: User = { user_id: result.userId, email: result.email, role: result.role,
      full_name: result.email, phone: "", created_at: "" };
    save({ user, token: result.token });
    return user;
  }
  function replaceToken(token: string) { if (session) save({ ...session, token }); }
  const updateProfile = useCallback((userId: number, profile: { fullName: string | null; phone: string | null; avatarUrl?: string | null }) => {
    setSession(current => {
      if (!current || current.user.user_id !== userId) return current;
      const fullName = profile.fullName ?? ""; const phone = profile.phone ?? "";
      const avatar = profile.avatarUrl === undefined ? current.user.avatar_url : profile.avatarUrl;
      if (current.user.full_name === fullName && current.user.phone === phone && current.user.avatar_url === avatar) return current;
      const next = { ...current, user: { ...current.user, full_name: fullName, phone, avatar_url: avatar } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* DB remains the source of truth. */ }
      return next;
    });
  }, []);
  return <AuthContext.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, loginApi, replaceToken, updateProfile, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải nằm trong <AuthProvider>");
  return ctx;
}
