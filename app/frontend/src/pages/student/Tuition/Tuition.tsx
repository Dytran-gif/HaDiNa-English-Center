import { useState } from "react";
import "../General.css";
import { useStudentApi, useStudentTuition } from "../../../services/student/useStudentApi";
import { useLang } from "../../../i18n/LanguageContext";
import PaymentFE from "./Components/Payment";
import PaymentHistory from "./Components/PaymentHistory";

export default function StudentTuition() {
    const { data: tuitionItems, reload: reloadTuition } = useStudentTuition();
    const api = useStudentApi();
    const { t } = useLang();
    const [paying, setPaying] = useState(false);

    // Khoản chưa thanh toán -> bảng chọn thanh toán; đã thanh toán -> lịch sử
    const unpaid = tuitionItems.filter(item => !item.isPaid);
    const paid = tuitionItems.filter(item => item.isPaid);

    // Bấm thanh toán: gọi BE tạo phiếu thu, thông báo thành công, tải lại danh sách
    const handlePay = async (enrollmentIds: number[]) => {
        if (paying || enrollmentIds.length === 0) return;
        setPaying(true);
        try {
            const res = await api.send<{ created: number; message?: string }>(
                "POST", "tuition/pay", { enrollmentIds }
            );
            alert(res.message ?? t("alerts.payOk", { n: res.created }));
            reloadTuition();
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.payFailed"));
        } finally {
            setPaying(false);
        }
    };

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-12"> 
                    <PaymentFE items={unpaid} onPay={handlePay} />
                </div>
                <div className="col-12">
                    <PaymentHistory items={paid} />
                </div>
            </div>
        </div>
    );
}
