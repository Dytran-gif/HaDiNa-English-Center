export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;
  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
export function assetUrl(path?: string | null) {
  if (!path || !/^(\/uploads\/|https?:\/\/)/i.test(path)) return undefined;
  return path.startsWith("/") ? baseUrl + path : path;
}

export async function request<T>(path: string, token?: string | null, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(baseUrl + path, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Không kết nối được máy chủ. Kiểm tra BE và kết nối mạng rồi thử lại.");
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const errors = (body?.errors ?? {}) as Record<string, string[]>;
    const fields = Object.values(errors).flat().join(" ");
    throw new ApiError(response.status, body?.message || fields || (response.status === 401
      ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      : response.status === 403 ? "Bạn không có quyền thực hiện thao tác này." : "Không thể thực hiện yêu cầu."), errors);
  }
  if (body === null) throw new ApiError(0, "Máy chủ chưa trả dữ liệu hợp lệ. Kiểm tra địa chỉ API.");
  return body as T;
}
