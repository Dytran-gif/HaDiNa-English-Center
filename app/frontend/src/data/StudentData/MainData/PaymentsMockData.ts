import type { Payment } from "../../../types/StudentTypes/MainTypes";

export const mockPayments: Payment[] = [
    { id: "pay-01", enrollmentId: "enr-01", createdByUserId: "usr-06", amount: 2000000, method: "Banking", paidDate: "2025-05-10", note: "Thanh toán qua CK Vietcombank", createdAt: "2025-05-10" },
    { id: "pay-02", enrollmentId: "enr-02", createdByUserId: "usr-06", amount: 1620000, method: "Banking", paidDate: "2025-05-11", note: "Thanh toán qua VNPay", createdAt: "2025-05-11" },
    { id: "pay-03", enrollmentId: "enr-03", createdByUserId: "usr-06", amount: 2000000, method: "Cash", paidDate: "2025-05-12", note: "Đã nộp tiền mặt tại trung tâm", createdAt: "2025-05-12" },
    { id: "pay-04", enrollmentId: "enr-05", createdByUserId: "usr-06", amount: 2500000, method: "CreditCard", paidDate: "2025-01-05", note: "Thanh toán thẻ Visa", createdAt: "2025-01-05" }
];