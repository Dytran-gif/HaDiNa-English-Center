import { useContext } from "react";
import { ToastContext } from "./ToastContext";
export default function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast cần được dùng bên trong ToastProvider của Admin.");
  return value;
}
