import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";
import { findAccount } from "../data/users";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
}

const STORAGE_KEY = "ecw_auth_user";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as User) : null;
  });

  function login(email: string, password: string): User | null {
    const found = findAccount(email, password);
    if (!found) return null;
    setUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    return found;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải nằm trong <AuthProvider>");
  return ctx;
}