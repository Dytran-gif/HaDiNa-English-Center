import { useState } from "react";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import {
    useStudentApi,
    useStudentCourseDetail,
    useStudentAssignments,
    type StudentAssignmentItem
} from "../../../../services/student/useStudentApi";
import "./CourseDetailModal.css";

interface Props {
    course: Course;
    onClose: () => void;
}

const DAY_LABELS: Record<string, string> = {
    Mon: "Thứ 2", Tue: "Thứ 3", Wed: "Thứ 4", Thu: "Thứ 5",
    Fri: "Thứ 6", Sat: "Thứ 7", Sun: "Chủ nhật"
};

function formatDate(d?: string) {
    if (!d) return "—";
    const parts = d.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
}

export default function CourseDetailModal({ course, onClose }: Props) {
    const [tab, setTab] = useState<'info' | 'assignments'>('info');
    const { data: detail, loading: detailLoading } = useStudentCourseDetail(course.id);
    const { data: assignments, loading, reload } = useStudentAssignments(course.id);
    const api = useStudentApi();
    const [busyId, setBusyId] = useState<number | null>(null);

    const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + ' VNĐ';

    const handleDownload = async (a: StudentAssignmentItem) => {
        try {
            await api.download(`assignments/${a.id}/download`, a.fileName);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Tải file thất bại.");
        }
    };

    const handleDownloadMy = async (a: StudentAssignmentItem) => {
        try {
            await api.download(`assignments/${a.id}/my-submission/download`, a.mySubmission?.fileName);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Tải file thất bại.");
        }
    };

    const handleSubmit = async (a: StudentAssignmentItem, file: File) => {
        setBusyId(a.id);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await api.upload<{ message?: string }>(`assignments/${a.id}/submit`, form);
            alert(res.message ?? "Nộp bài thành công!");
            reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Nộp bài thất bại.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="cdm-overlay" onClick={onClose}>
            <div className="cdm-content" onClick={(e) => e.stopPropagation()}>
                <header className="cdm-header">
                    <div className="cdm-title-box">
                        <h2>{detail?.name ?? course.name}</h2>
                        {detail && (
                            <span className="cdm-band">Band {detail.bandFrom} - {detail.bandTo}</span>
                        )}
                    </div>
                    <button className="cdm-close" onClick={onClose}>×</button>
                </header>

                <div className="cdm-tabs">
                    <button
                        className={`cdm-tab ${tab === 'info' ? 'active' : ''}`}
                        onClick={() => setTab('info')}
                    >
                        Thông tin khóa học
                    </button>
                    <button
                        className={`cdm-tab ${tab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setTab('assignments')}
                    >
                        Bài tập{assignments.length > 0 ? ` (${assignments.length})` : ""}
                    </button>
                </div>

                <div className="cdm-body">
                    {tab === 'info' && (
                        <div className="cdm-info">
                            {detailLoading && <p className="cdm-muted">Đang tải thông tin khóa học...</p>}
                            {detail && (
                                <>
                                    <p className="cdm-desc">{detail.description || "Chưa có mô tả."}</p>

                                    <div className="cdm-meta">
                                        <div><span>Band</span><strong>{detail.bandFrom} - {detail.bandTo}</strong></div>
                                        <div><span>Tổng số buổi</span><strong>{detail.totalSessions}</strong></div>
                                        <div><span>Buổi/tuần</span><strong>{detail.sessionsPerWeek}</strong></div>
                                        <div><span>Học phí</span><strong>{formatCurrency(detail.tuition)}</strong></div>
                                        {detail.discountPercent > 0 && (
                                            <div><span>Giảm giá</span><strong>-{detail.discountPercent}%</strong></div>
                                        )}
                                    </div>

                                    <section className="cdm-section">
                                        <h3><i className="fa-solid fa-chalkboard-user"></i> Giáo viên</h3>
                                        {detail.teachers.length > 0 ? (
                                            detail.teachers.map((t, i) => (
                                                <div key={i} className="cdm-teacher">
                                                    <strong>{t.fullName}</strong>
                                                    {(t.specialty || t.degree) && (
                                                        <span className="cdm-teacher-extra">
                                                            {[t.specialty, t.degree].filter(Boolean).join(" · ")}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="cdm-muted">Chưa có thông tin giáo viên.</p>
                                        )}
                                    </section>

                                    <section className="cdm-section">
                                        <h3><i className="fa-solid fa-users"></i> Lớp học & lịch học</h3>
                                        {detail.classes.length > 0 ? (
                                            detail.classes.map((c) => (
                                                <div key={c.id} className="cdm-class">
                                                    <div className="cdm-class-head">
                                                        <strong>{c.name}</strong>
                                                        <span>GV: {c.teacherName}</span>
                                                    </div>
                                                    <div className="cdm-class-meta">
                                                        <span>{formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
                                                        <span>Tối đa {c.maxStudents} học viên</span>
                                                    </div>
                                                    {c.schedules.length > 0 ? (
                                                        <table className="cdm-schedules">
                                                            <thead>
                                                                <tr><th>Thứ</th><th>Giờ học</th><th>Phòng</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                {c.schedules.map((s, i) => (
                                                                    <tr key={i}>
                                                                        <td>{DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek}</td>
                                                                        <td>{s.startTime} - {s.endTime}</td>
                                                                        <td>{s.roomName ?? "—"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p className="cdm-muted">Chưa có lịch học.</p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="cdm-muted">Chưa có lớp học.</p>
                                        )}
                                    </section>
                                </>
                            )}
                        </div>
                    )}

                    {tab === 'assignments' && (
                        <div className="cdm-assignments">
                            {loading && <p className="cdm-muted">Đang tải bài tập...</p>}
                            {!loading && assignments.length === 0 && (
                                <p className="cdm-muted">Chưa có bài tập.</p>
                            )}
                            {assignments.map((a) => (
                                <div key={a.id} className="cdm-assignment">
                                    <div className="cdm-assignment-head">
                                        <h3>{a.title}</h3>
                                        <span className="cdm-date">
                                            {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    {a.description && <p className="cdm-assignment-desc">{a.description}</p>}

                                    <div className="cdm-file-row">
                                        {a.hasFile ? (
                                            <button className="cdm-link" onClick={() => handleDownload(a)}>
                                                <i className="fa-solid fa-download"></i> {a.fileName}
                                            </button>
                                        ) : (
                                            <span className="cdm-muted">Không có file đính kèm</span>
                                        )}
                                    </div>

                                    <div className="cdm-submit">
                                        {a.mySubmission ? (
                                            <div className="cdm-submitted">
                                                <span className="cdm-ok">
                                                    <i className="fa-solid fa-circle-check"></i> Đã nộp: {a.mySubmission.fileName}
                                                </span>
                                                <button className="cdm-link" onClick={() => handleDownloadMy(a)}>
                                                    <i className="fa-solid fa-download"></i> Tải bài đã nộp
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="cdm-upload-row">
                                                <label className="cdm-upload-btn">
                                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                                    {busyId === a.id ? ' Đang nộp...' : ' Nộp bài'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        disabled={busyId === a.id}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0];
                                                            e.target.value = '';
                                                            if (f) handleSubmit(a, f);
                                                        }}
                                                    />
                                                </label>
                                                <span className="cdm-muted">PDF, DOC, DOCX · tối đa 15MB</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
