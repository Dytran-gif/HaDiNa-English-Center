export type RequestType = "leave" | "swap";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface ScheduleRequest {
  request_id: number;
  teacher_id: number;
  course_id: number;
  type: RequestType;
  original_date: string;
  proposed_date?: string;
  reason: string;
  status: RequestStatus;
  created_at: string;
}
