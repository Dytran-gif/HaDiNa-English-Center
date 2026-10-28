import type { Payment } from "../../types";

// Mock dữ liệu học phí/thanh toán — chưa có backend/cổng thanh toán thật.
// TODO: khi có backend, thay bằng API hóa đơn thật.
export const adminPayments: Payment[] = [
    {
        payment_id: 1,
        user_id: 1,
        course_id: 1,
        amount: 5500000,
        status: "paid",
        method: "bank_transfer",
        due_date: "2026-07-15",
        paid_date: "2026-07-12",
    },
    {
        payment_id: 2,
        user_id: 1,
        course_id: 5,
        amount: 6000000,
        status: "unpaid",
        method: "cash",
        due_date: "2026-08-25",
    },
    {
        payment_id: 3,
        user_id: 4,
        course_id: 1,
        amount: 5500000,
        status: "overdue",
        method: "bank_transfer",
        due_date: "2026-08-01",
        note: "Học viên xin gia hạn thêm 1 tuần",
    },
    {
        payment_id: 4,
        user_id: 4,
        course_id: 6,
        amount: 3200000,
        status: "paid",
        method: "card",
        due_date: "2026-07-20",
        paid_date: "2026-07-18",
    },
];
