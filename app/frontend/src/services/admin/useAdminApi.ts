import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, request } from "../apiClient";

export function useAdminApi() {
  const { token, logout } = useAuth();
  return useMemo(() => ({
    async get<T>(path: string, signal?: AbortSignal) {
      if (!token) throw new ApiError(401, "Đăng nhập bằng tài khoản thật để tải và lưu dữ liệu.");
      try { return await request<T>(`/api/admin/${path}`, token, { signal }); }
      catch (error) { if (error instanceof ApiError && error.status === 401) logout(); throw error; }
    },
    async send<T = void>(method: string, path: string, body?: unknown) {
      if (!token) throw new ApiError(401, "Đăng nhập bằng tài khoản thật để lưu dữ liệu.");
      try { return await request<T>(`/api/admin/${path}`, token, { method, body: body === undefined ? undefined : JSON.stringify(body) }); }
      catch (error) { if (error instanceof ApiError && error.status === 401) logout(); throw error; }
    },
  }), [token, logout]);
}

export function useAdminQuery<T>(path: string, allPages = false) {
  const api = useAdminApi();
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(undefined); setError(""); setLoading(true);
    async function load() {
      const first = await api.get<T>(path, controller.signal);
      if (!allPages) return first;
      const paged = first as T & { items: unknown[]; totalPages: number };
      if (!Array.isArray(paged.items)) return first;
      const items = [...paged.items];
      const [resource, search] = path.split("?");
      for (let page = 2; page <= paged.totalPages; page++) {
        const query = new URLSearchParams(search);
        query.set("page", String(page));
        const next = await api.get<{ items: unknown[] }>(`${resource}?${query}`, controller.signal);
        items.push(...next.items);
      }
      return { ...paged, items } as T;
    }
    load().then(value => {
      if (!controller.signal.aborted) setData(value);
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Không tải được dữ liệu.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [api, path, revision, allPages]);
  return { data, error, loading, reload: () => setRevision(v => v + 1) };
}
