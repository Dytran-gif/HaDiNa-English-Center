export type PaymentStatus = "paid" | "unpaid" | "overdue";
export type PaymentMethod = "cash" | "bank_transfer" | "card";

export interface Payment {
  payment_id: number;
  user_id: number;
  course_id: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  due_date: string;
  paid_date?: string;
  note?: string;
}
