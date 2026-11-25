export type AdminRecord = { id: number; [key: string]: unknown };
export interface DashboardKpisResponse { activeStudents: number; openClasses: number; teachers: number; monthlyRevenue: number; totalRevenue: number }
export interface RevenueMonthResponse { month: string; revenue: number }
export interface PagedResponse<T> {
  items: T[]; totalItems: number; total?: number; page: number; pageSize: number; totalPages: number;
}
export interface CenterResponse { name: string; logoUrl: string | null; address: string | null; phone: string | null }
export interface Schedule { dayOfWeek: number; startTime: string; endTime: string; roomId: number; roomName?: string }
export interface ClassResponse extends AdminRecord {
  code: string; name: string; courseId: number; courseName: string; teacherId: number; teacherName: string;
  startDate: string; endDate: string; maxStudents: number; enrolledCount: number; meetingUrl: string | null;
  status: string; schedules: Schedule[]; students?: AdminRecord[];
}
export type PaymentStatus = "Pending" | "Confirmed" | "Rejected" | "Cancelled";
export interface PaymentResponse extends AdminRecord {
  enrollmentId: number; studentId: number; studentName: string; studentCode: string; classId: number; classCode: string;
  className: string; courseName: string; tuitionFee: number; discountPercent: number; discountAmount: number;
  finalTuitionFee: number; amount: number; paidDate: string; method: string;
  receiptNo: string | null; kind: "Payment" | "Refund"; status: PaymentStatus; transferRef: string | null;
  note: string | null; cancelReason: string | null; requestedByStudent: boolean; createdAt: string; confirmedAt: string | null;
}
/** Công nợ theo ghi danh (GET payments/receivables) */
export interface ReceivableResponse {
  enrollmentId: number; studentId: number; studentCode: string; studentName: string; studentPhone: string;
  classId: number; classCode: string; courseName: string; enrollmentStatus: string; classStartDate: string;
  finalTuitionFee: number; paidAmount: number; refundedAmount: number; pendingAmount: number; remainingAmount: number;
  paymentStatus: "Unpaid" | "Partial" | "Paid" | "Refunded";
}
export interface PaymentSummaryResponse {
  receivable: number; collected: number; outstanding: number; pendingCount: number; pendingAmount: number; debtorCount: number;
}
export interface ReceiptResponse {
  payment: PaymentResponse; center: CenterResponse; createdByName: string; createdByEmail: string; note: string | null;
}
export interface EnrollmentResponse extends AdminRecord {
  classId: number; classCode: string; className: string; courseName: string; classStatus: string; status: string;
  tuitionFee: number; discountPercent: number; discountAmount: number; extraDiscountAmount: number; discountNote: string | null;
  finalTuitionFee: number; paymentId: number | null;
  paidAmount: number; refundedAmount: number; pendingAmount: number; remainingAmount: number;
  paymentStatus: "Unpaid" | "Partial" | "Paid" | "Refunded";
}
export interface StudentResponse extends AdminRecord { fullName: string; enrollments: EnrollmentResponse[] }
