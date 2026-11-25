import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../../../i18n/LanguageContext";
import "../../StudentExtra.css";

export interface SessionInfo {
    courseName: string;
    classCode?: string;
    className?: string;
    dateStr?: string;        // yyyy-MM-dd
    startTime?: string;      // HH:mm
    endTime?: string;
    sessionNo?: number;
    totalSessions?: number;
    teacherName?: string;
    roomName?: string;
    meetingUrl?: string;
    attendanceStatus?: string | null;
    newAssignments?: number;
}

const statusClass = (s?: string | null) => (s ? `is-${s.toLowerCase()}` : "is-neutral");

// Popup chi tiết một buổi học: dùng chung cho Lịch học (bấm vào buổi) và thẻ "Buổi học tiếp theo" ở Dashboard
export default function SessionDetail({ session, onClose }: { session: SessionInfo; onClose: () => void }) {
    const { t, date } = useLang();
    const navigate = useNavigate();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const weekday = session.dateStr
        ? new Date(`${session.dateStr}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long" })
        : "";

    return (
        <div className="sx-overlay" role="presentation" onClick={onClose}>
            <div className="sx-modal" role="dialog" aria-modal="true" aria-labelledby="sx-session-title" onClick={e => e.stopPropagation()}>
                <div className="sx-modal-head">
                    <div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {session.classCode && <span className="sx-code">{session.classCode}</span>}
                            {session.sessionNo ? (
                                <span className="sx-chip is-ongoing">
                                    {t("sx.sessionOf", { n: session.sessionNo, total: session.totalSessions ?? "?" })}
                                </span>
                            ) : null}
                        </div>
                        <h3 id="sx-session-title">{session.courseName}</h3>
                        {session.className && <p className="sx-muted" style={{ margin: "2px 0 0" }}>{session.className}</p>}
                    </div>
                    <button type="button" className="sx-close" onClick={onClose} aria-label={t("sx.close")}>×</button>
                </div>

                <dl className="sx-dl">
                    {session.dateStr && (<><dt>{t("sx.date")}</dt><dd>{weekday}, {date(session.dateStr)}</dd></>)}
                    {session.startTime && (<><dt>{t("sx.time")}</dt><dd>{session.startTime.slice(0, 5)} – {session.endTime?.slice(0, 5)}</dd></>)}
                    {session.roomName && (<><dt>{t("sx.room")}</dt><dd>{session.roomName}</dd></>)}
                    {session.teacherName && (<><dt>{t("sx.teacher")}</dt><dd>{session.teacherName}</dd></>)}
                    {session.meetingUrl && (<><dt>{t("sx.online")}</dt><dd><a href={session.meetingUrl} target="_blank" rel="noreferrer">{session.meetingUrl}</a></dd></>)}
                    {session.newAssignments !== undefined && (<><dt>{t("sx.assignments")}</dt><dd>{session.newAssignments > 0 ? t("sx.newAssignments", { n: session.newAssignments }) : t("sx.noNewAssignments")}</dd></>)}
                    {session.attendanceStatus !== undefined && (
                        <>
                            <dt>{t("sx.attendance")}</dt>
                            <dd><span className={`sx-chip ${statusClass(session.attendanceStatus)}`}>
                                {session.attendanceStatus ? t(`status.${session.attendanceStatus.toLowerCase()}`) : t("sx.notMarked")}
                            </span></dd>
                        </>
                    )}
                </dl>

                <div className="sx-modal-foot">
                    <button type="button" className="sx-btn" onClick={() => { onClose(); navigate("/student/courses"); }}>
                        <i className="fa-solid fa-book-open"></i> {t("sx.viewClass")}
                    </button>
                    {session.meetingUrl && (
                        <a className="sx-btn is-primary" href={session.meetingUrl} target="_blank" rel="noreferrer">
                            <i className="fa-solid fa-video"></i> {t("sx.joinOnline")}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
