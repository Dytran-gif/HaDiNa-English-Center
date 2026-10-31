export type AdminRecord = { id: number; [key: string]: unknown };
export interface PagedResponse<T> {
  items: T[]; totalItems: number; total?: number; page: number; pageSize: number; totalPages: number;
}
export interface CenterResponse { name: string; logoUrl: string | null; address: string | null; phone: string | null }
export interface Schedule { dayOfWeek: number; startTime: string; endTime: string; roomId: number; roomName?: string }
export interface ClassResponse extends AdminRecord {
  name: string; courseId: number; courseName: string; teacherId: number; teacherName: string;
  startDate: string; endDate: string; maxStudents: number; enrolledCount: number; meetingUrl: string | null;
  status: string; schedules: Schedule[]; students?: AdminRecord[];
}
export interface PaymentResponse extends AdminRecord {
  studentName: string; studentCode: string; className: string; courseName: string; tuitionFee: number;
  discountPercent: number; discountAmount: number; amount: number; paidDate: string; method: string;
}
export interface ReceiptResponse {
  payment: PaymentResponse; center: CenterResponse; createdByName: string; createdByEmail: string; note: string | null;
}
export interface EnrollmentResponse extends AdminRecord {
  classId: number; className: string; courseName: string; classStatus: string; status: string;
  tuitionFee: number; discountPercent: number; finalTuitionFee: number; paymentId: number | null;
}
export interface StudentResponse extends AdminRecord { fullName: string; enrollments: EnrollmentResponse[] }
