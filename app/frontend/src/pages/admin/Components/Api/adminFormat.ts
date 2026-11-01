export const money = (value: unknown) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value ?? 0));
const labels: Record<string, string> = { Teaching: "Đang dạy", OnLeave: "Tạm nghỉ", Studying: "Đang học", OnHold: "Bảo lưu", Dropped: "Đã nghỉ", Upcoming: "Sắp mở", Ongoing: "Đang học", Finished: "Đã kết thúc", Active: "Đang ghi danh", Cash: "Tiền mặt", Transfer: "Chuyển khoản", Pending: "Chờ duyệt", Approved: "Đã duyệt", Rejected: "Từ chối", Cancelled: "Đã hủy", Leave: "Xin nghỉ", Reschedule: "Đổi lịch", AttendanceUnlock: "Mở điểm danh" };
export function display(value: unknown): string {
  if (value === true) return "Đã khóa";
  if (value === false) return "Đang mở";
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split("-").reverse().join("/");
  return labels[String(value)] ?? String(value);
}
