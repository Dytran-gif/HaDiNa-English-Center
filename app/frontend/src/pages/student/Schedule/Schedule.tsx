import { useState } from "react";
import "../General.css"
// Components
import ScheduleGridFE from "./Components/ScheduleMain";
import ScheduleNoticeFE from "./Components/ScheduleNotice"; 
import ScheduleHistoryFE from "./Components/ScheduleHistory";
// API
import { useStudentSchedule, useStudentScheduleHistory } from "../../../services/student/useStudentApi";

// Thứ 2 đầu tuần của một ngày bất kỳ
function startOfWeekMonday(d: Date): Date {
    const r = new Date(d);
    const jsDay = r.getDay();
    const diff = jsDay === 0 ? -6 : 1 - jsDay;
    r.setDate(r.getDate() + diff);
    r.setHours(0, 0, 0, 0);
    return r;
}

function formatDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function StudentSchedule() {
    // Tuần đang xem (mặc định tuần hiện tại)
    const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMonday(new Date()));

    const { data: schedule } = useStudentSchedule(formatDateStr(weekStart));
    const { data: history } = useStudentScheduleHistory();

    const handlePrevWeek = () => {
        const prev = new Date(weekStart);
        prev.setDate(prev.getDate() - 7);
        setWeekStart(prev);
    };

    const handleNextWeek = () => {
        const next = new Date(weekStart);
        next.setDate(next.getDate() + 7);
        setWeekStart(next);
    };

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9">
                    <ScheduleGridFE 
                        weekStart={weekStart} 
                        sessions={schedule?.sessions ?? []} 
                        onPrevWeek={handlePrevWeek} 
                        onNextWeek={handleNextWeek} 
                    />
                </div>
                <div className="col-3">
                    <ScheduleHistoryFE items={history ?? []} />
                </div>
                <div className="col-9">
                    <ScheduleNoticeFE notices={schedule?.notices ?? []} />
                </div>
            </div>
        </div>
    );
}
