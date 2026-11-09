import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, request } from "../apiClient";

// Gọi API vùng Teacher (docs/api/TEACHER_API.md). Mọi đường dẫn tính từ /api/teacher/.
// Page KHÔNG gọi fetch trực tiếp: dùng useTeacherApi / useTeacherQuery trong file này.

const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const NEED_LOGIN = "Đăng nhập bằng tài khoản giáo viên thật (teacher@demo.com) để tải dữ liệu.";

async function readError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const errors = (body?.errors ?? {}) as Record<string, string[]>;
  const fields = Object.values(errors).flat().join(" ");
  return new ApiError(response.status, body?.message || fields || (response.status === 401
    ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
    : response.status === 413 ? "File quá lớn." : "Không thể thực hiện yêu cầu."), errors);
}

async function rawFetch(path: string, token: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(baseUrl + path, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });
  } catch {
    throw new ApiError(0, "Không kết nối được máy chủ. Kiểm tra BE và kết nối mạng rồi thử lại.");
  }
  if (!response.ok) throw await readError(response);
  return response;
}

export function useTeacherApi() {
  const { token, logout } = useAuth();
  return useMemo(() => {
    async function guard<T>(run: (token: string) => Promise<T>): Promise<T> {
      if (!token) throw new ApiError(401, NEED_LOGIN);
      try { return await run(token); }
      catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    }
    return {
      get<T>(path: string, signal?: AbortSignal) {
        return guard(t => request<T>(`/api/teacher/${path}`, t, { signal }));
      },
      send<T = void>(method: "POST" | "PUT" | "DELETE", path: string, body?: unknown) {
        return guard(t => request<T>(`/api/teacher/${path}`, t,
          { method, body: body === undefined ? undefined : JSON.stringify(body) }));
      },
      // Upload multipart (field "file"). Trả { url, ... }
      upload<T = { url: string }>(path: string, file: File | Blob, fileName?: string) {
        return guard(async t => {
          const form = new FormData();
          form.append("file", file, fileName ?? (file instanceof File ? file.name : "file"));
          const response = await rawFetch(`/api/teacher/${path}`, t, { method: "POST", body: form });
          return (await response.json()) as T;
        });
      },
      // Tải file (Excel sổ điểm) rồi cho trình duyệt lưu
      download(path: string, fallbackName: string) {
        return guard(async t => {
          const response = await rawFetch(`/api/teacher/${path}`, t);
          const disposition = response.headers.get("Content-Disposition") ?? "";
          const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
          const name = match ? decodeURIComponent(match[1] ?? match[2]) : fallbackName;
          const url = URL.createObjectURL(await response.blob());
          const a = document.createElement("a");
          a.href = url; a.download = name; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
      },
      // Mở trang HTML (phiếu cuối khóa) ở cửa sổ mới rồi gọi in
      openPrint(path: string, target: Window | null) {
        return guard(async t => {
          const response = await rawFetch(`/api/teacher/${path}`, t);
          const html = await response.text();
          if (!target) throw new ApiError(0, "Trình duyệt đã chặn cửa sổ mới. Hãy cho phép popup rồi thử lại.");
          target.document.open(); target.document.write(html); target.document.close();
          target.focus();
          setTimeout(() => target.print(), 300);
        });
      },
    };
  }, [token, logout]);
}

export type TeacherApi = ReturnType<typeof useTeacherApi>;

// Tải dữ liệu cho page: trả data / loading / error / reload. path = null thì không tải.
export function useTeacherQuery<T>(path: string | null) {
  const api = useTeacherApi();
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(path !== null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (path === null) { setData(undefined); setLoading(false); setError(""); return; }
    const controller = new AbortController();
    setLoading(true); setError("");
    api.get<T>(path, controller.signal)
      .then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(reason => {
        if (controller.signal.aborted) return;
        setData(undefined);
        setError(reason instanceof Error ? reason.message : "Không tải được dữ liệu.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [api, path, revision]);
  const reload = useCallback(() => setRevision(v => v + 1), []);
  return { data, error, loading, reload, setData };
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
}

export function query(params: Record<string, string | number | boolean | null | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== null && value !== "") q.set(key, String(value));
  const s = q.toString();
  return s ? `?${s}` : "";
}
