import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, vi, type Dict } from "./dictionaries";

export type Lang = "vi" | "en";

const STORAGE_KEY = "student.lang";
const DICTS: Record<Lang, Dict> = { vi, en };

interface LanguageContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    /** Dịch theo key, hỗ trợ nội suy {tenBien} */
    t: (key: string, vars?: Record<string, string | number>) => string;
    /** Format tiền theo ngôn ngữ hiện tại: 12.500.000 VNĐ / 12,500,000 VND */
    money: (amount: number) => string;
    /** Format ngày yyyy-mm-dd -> dd/mm/yyyy */
    date: (value?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readSavedLang(): Lang {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "en" || saved === "vi" ? saved : "en";
    } catch {
        return "en";
    }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(readSavedLang);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch {
            // localStorage bị chặn thì chỉ đổi trong phiên hiện tại
        }
        document.documentElement.lang = lang;
    }, [lang]);

    const value = useMemo<LanguageContextValue>(() => {
        const dict = DICTS[lang];
        const t = (key: string, vars?: Record<string, string | number>) => {
            const template = dict[key] ?? vi[key] ?? key;
            if (!vars) return template;
            return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
        };
        const money = (amount: number) =>
            `${amount.toLocaleString(lang === "vi" ? "vi-VN" : "en-US")} ${t("common.currency")}`;
        const date = (v?: string | null) => {
            if (!v || v === "N/A") return "—";
            const parts = v.slice(0, 10).split("-");
            return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : v;
        };
        return { lang, setLang: setLangState, t, money, date };
    }, [lang]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLang phải dùng bên trong <LanguageProvider>");
    return ctx;
}