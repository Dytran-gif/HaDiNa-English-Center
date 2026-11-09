// Định dạng ngày giờ theo quy ước dự án: API trả giờ địa phương VN, không có "Z".
// KHÔNG dùng toISOString() khi gửi lên (sẽ lệch 7 tiếng).

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-11-05" hoặc "2026-11-05T18:00:00" -> "05/11/2026" */
export function fmtDate(value?: string | null) {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return d && m && y ? `${d}/${m}/${y}` : value;
}

/** "18:00:00" -> "18:00" */
export function fmtTime(value?: string | null) {
  return value ? value.slice(0, 5) : "—";
}

/** "2026-11-05T23:59:00" -> "23:59 05/11/2026" */
export function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const time = value.length > 10 ? value.slice(11, 16) : "";
  return `${time ? time + " " : ""}${fmtDate(value)}`.trim();
}

export function fmtNumber(value?: number | null, digits = 1) {
  if (value === null || value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

/** 1 = Thứ Hai ... 7 = Chủ nhật (quy ước dự án) */
export const dayNames = ["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

/** Thứ của một ngày "yyyy-MM-dd" theo quy ước 1..7 */
export function dayNo(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const js = new Date(y, m - 1, d).getDay(); // 0 = CN
  return js === 0 ? 7 : js;
}

/** Ngày hôm nay theo giờ máy, dạng "yyyy-MM-dd" */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const x = new Date(y, m - 1, d + days);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

/** Giá trị cho <input type="datetime-local"> từ "2026-11-05T23:59:00" */
export function toInputDateTime(value?: string | null) {
  return value ? value.slice(0, 16) : "";
}

/** "2026-11-05T23:59" (input) -> "2026-11-05T23:59:00" (gửi API) */
export function fromInputDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

/** "18:00" (input time) -> "18:00:00" */
export function fromInputTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}

/** Thời điểm sau n ngày lúc 23:59, dạng datetime-local */
export function defaultDue(days = 7) {
  return `${addDays(todayStr(), days)}T23:59`;
}

export const sessionStatusLabel: Record<string, string> = {
  Upcoming: "Sắp tới", Ongoing: "Đang dạy", Done: "Đã xong", Cancelled: "Đã hủy",
};
export const classStatusLabel: Record<string, string> = {
  Upcoming: "Sắp mở", Ongoing: "Đang học", Finished: "Đã kết thúc",
};
export const attendanceLabel: Record<string, string> = {
  Present: "Có mặt", Late: "Muộn", Absent: "Vắng", Excused: "Có phép",
};
export const submissionStatusLabel: Record<string, string> = {
  Submitted: "Chờ chấm", Draft: "Đã chấm nháp", Published: "Đã công bố", Returned: "Trả bài sửa",
};
export const skillLabel: Record<string, string> = {
  Writing: "Writing", Speaking: "Speaking", Reading: "Reading", Listening: "Listening",
};
export const examTypeLabel: Record<string, string> = {
  Periodic: "Định kỳ", Midterm: "Giữa kỳ", Final: "Cuối kỳ",
};
export const requestTypeLabel: Record<string, string> = {
  Leave: "Xin nghỉ", Reschedule: "Đổi buổi", OneOnOneBooking: "Đặt lịch 1 kèm 1", OneOnOneCancel: "Hủy buổi 1 kèm 1",
  AttendanceUnlock: "Mở lại điểm danh",
};
export const requestStatusLabel: Record<string, string> = {
  Pending: "Chờ xử lý", Approved: "Đã duyệt", Rejected: "Từ chối", Cancelled: "Đã hủy",
};
export const enrollmentLabel: Record<string, string> = {
  Active: "Đang học", OnHold: "Bảo lưu", Dropped: "Đã nghỉ",
};
export const eventKindLabel: Record<string, string> = {
  Class: "Buổi học", Makeup: "Dạy bù", OneOnOne: "1 kèm 1",
};
export const criterionName: Record<string, string> = {
  TR: "Task Response", CC: "Coherence & Cohesion", FC: "Fluency & Coherence",
  LR: "Lexical Resource", GRA: "Grammar Range & Accuracy", P: "Pronunciation",
};

export type Tone = "ink" | "red" | "yellow" | "green";
export function toneOf(status?: string | null): Tone {
  switch (status) {
    case "Present": case "Done": case "Published": case "Approved": case "Ongoing": case "Pass": return "green";
    case "Absent": case "Cancelled": case "Rejected": case "Fail": return "red";
    case "Late": case "Submitted": case "Pending": case "Upcoming": case "Draft": case "Returned": return "yellow";
    default: return "ink";
  }
}

/** Danh sách bước 0.5 từ 0 đến 9 cho ô chọn band */
export const bandOptions = Array.from({ length: 19 }, (_, i) => i / 2);
