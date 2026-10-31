import { createContext } from "react";
import type { Tone } from "./types";
export interface ToastInput { title: string; description?: string; tone?: Exclude<Tone, "neutral">; key?: string; duration?: number }
export interface ToastEntry extends ToastInput { id: number }
export interface ToastApi { notify: (toast: ToastInput) => number; dismiss: (id: number) => void }
export const ToastContext = createContext<ToastApi | undefined>(undefined);
