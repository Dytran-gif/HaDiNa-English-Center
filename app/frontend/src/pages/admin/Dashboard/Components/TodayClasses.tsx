import { useState } from "react";
import type { ClassResponse, PagedResponse } from "../../../../types/adminApi";
import { useAdminQuery } from "../../../../services/admin/useAdminApi";
import Button from "../../Components/Ui/Button";
import EmptyState from "../../Components/Ui/EmptyState";
import { InputField } from "../../Components/Ui/FormField";
import Notice from "../../Components/Ui/Notice";
import SectionCard from "../../Components/Ui/SectionCard";
import TableSkeleton from "../../Components/Ui/TableSkeleton";
import "../../Components/Api/AdminApi.css";
import "../Dashboard.css";

function todayInVietnam() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default function TodayClasses() {
  const [date, setDate] = useState(todayInVietnam);
  const { data, loading, error, reload } = useAdminQuery<PagedResponse<ClassResponse>>("classes?pageSize=100", true);
  const [year, month, day] = date.split("-").map(Number);
  // API uses Monday=1 ... Sunday=7, unlike JavaScript's Sunday=0.
  const weekday = new Date(year, month - 1, day).getDay() || 7;
  const scheduled = (data?.items ?? []).filter(item => date && item.startDate <= date && item.endDate >= date && item.schedules.some(schedule => schedule.dayOfWeek === weekday));
  const firstTime = (item: ClassResponse) => item.schedules.filter(schedule => schedule.dayOfWeek === weekday).map(schedule => schedule.startTime).sort()[0] ?? "";
  scheduled.sort((a, b) => firstTime(a).localeCompare(firstTime(b)) || a.name.localeCompare(b.name, "vi"));

  return <SectionCard title="Lớp học hôm nay" action={<Button to="/admin/classes" variant="ghost">Xem tất cả lớp</Button>}>
    <div className="admin-today-controls">
      <InputField label="Ngày học" type="date" required value={date} onChange={event => setDate(event.target.value)}/>
      <Button type="button" onClick={() => setDate(todayInVietnam())}>Hôm nay</Button>
      <span role="status" className="admin-today-summary">{date ? loading ? "Đang tải lịch học…" : error ? "Chưa tải được lịch học" : `${scheduled.length} lớp trong ngày ${day}/${month}/${year}` : "Chọn ngày để xem lịch học"}</span>
    </div>
    {error ? <Notice tone="error" title="Không tải được lớp học" action={<Button onClick={reload}>Thử lại</Button>}>{error}</Notice> : !date ? <EmptyState title="Chọn ngày học" description="Chọn ngày để xem các lớp có lịch học tại trung tâm."/> : !loading && scheduled.length === 0 ? <EmptyState title="Không có lớp học trong ngày này" description="Không có lớp nào có lịch học vào ngày đã chọn. Bạn có thể chọn ngày khác để xem." icon="classes"/> :
      <div className="admin-api-table"><table className="admin-table" aria-label="Danh sách lớp theo ngày" aria-busy={loading}>
        <thead><tr><th scope="col">Tên lớp</th><th scope="col">Giáo viên dạy</th><th scope="col">Số học viên</th></tr></thead>
        <tbody>{loading ? <TableSkeleton columns={3} rows={3}/> : scheduled.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.teacherName || "Chưa phân công"}</td><td>{item.enrolledCount.toLocaleString("vi-VN")} học viên</td></tr>)}</tbody>
      </table></div>}
  </SectionCard>;
}
