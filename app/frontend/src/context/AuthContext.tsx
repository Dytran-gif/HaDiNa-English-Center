import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { User, UserRole } from "../types";
import { findAccount } from "../data/users";
import { request } from "../services/apiClient";

interface Session { user: User; token: string | null }
interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => User | null;
  loginApi: (email: string, password: string) => Promise<User>;
  replaceToken: (token: string) => void;
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
    return { user, token: typeof value.token === "string" ? value.token : null };
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
  function login(email: string, password: string): User | null {
    const found = findAccount(email, password);
    if (found) save({ user: found, token: null });
    return found;
  }
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
  return <AuthContext.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, login, loginApi, replaceToken, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải nằm trong <AuthProvider>");
  return ctx;
}
