import type { ReactNode } from "react";
import BaseTag from "../../../../components/ui/Tag";
import type { Tone } from "./types";
const tones: Record<string, Tone> = { Teaching: "success", Studying: "success", Active: "success", Ongoing: "success", Approved: "success", Published: "success", OnLeave: "warning", OnHold: "warning", Pending: "warning", Upcoming: "info", Finished: "neutral", Dropped: "neutral", Draft: "neutral", Rejected: "error", Cancelled: "neutral" };
const labels: Record<string, string> = { Teaching: "Đang dạy", Studying: "Đang học", Active: "Đang ghi danh", Ongoing: "Đang học", Approved: "Đã duyệt", Published: "Đã đăng", OnLeave: "Tạm nghỉ", OnHold: "Bảo lưu", Pending: "Chờ duyệt", Upcoming: "Sắp mở", Finished: "Đã kết thúc", Dropped: "Đã nghỉ", Draft: "Nháp", Rejected: "Từ chối", Cancelled: "Đã hủy" };
export default function Badge({ status, tone, children }: { status?: string; tone?: Tone; children?: ReactNode }) {
  return <span className={`admin-badge admin-tone--${tone ?? tones[status ?? ""] ?? "neutral"}`}><BaseTag>{children ?? labels[status ?? ""] ?? status ?? "—"}</BaseTag></span>;
}
