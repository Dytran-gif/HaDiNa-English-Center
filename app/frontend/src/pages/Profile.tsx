import PageShell from "../components/layout/PageShell";
import PageBanner from "../components/ui/PageBanner";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";
import { demoUser, getEnrollmentsByUser } from "../data/users";
import { courses, formatPrice } from "../data/courses";
import "./Profile.css";

const statusLabel: Record<string, string> = {
  confirmed: "Đã xác nhận",
  pending: "Chờ xác nhận",
  cancelled: "Đã huỷ",
};

export default function Profile() {
  const enrollments = getEnrollmentsByUser(demoUser.user_id);

  return (
    <PageShell>
      <PageBanner
        kicker="Tài khoản"
        title="Trang cá nhân"
        description="Trang demo — đồ án hiện chưa có backend/đăng nhập thật, dữ liệu bên dưới là dữ liệu mẫu."
      />

      <div className="container profile-grid">
        <Card className="profile-card">
          <h2>{demoUser.full_name}</h2>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>{demoUser.email}</dd>
            </div>
            <div>
              <dt>Điện thoại</dt>
              <dd>{demoUser.phone}</dd>
            </div>
            <div>
              <dt>Vai trò</dt>
              <dd>Học viên</dd>
            </div>
          </dl>
        </Card>

        <div className="profile-enrollments">
          <h3>Khoá học đã đăng ký</h3>
          {enrollments.length === 0 ? (
            <p>Bạn chưa đăng ký khoá học nào.</p>
          ) : (
            <ul>
              {enrollments.map((enrollment) => {
                const course = courses.find(
                  (c) => c.course_id === enrollment.course_id,
                );
                if (!course) return null;
                return (
                  <li key={enrollment.enrollment_id}>
                    <div>
                      <span className="profile-enrollments__name">
                        {course.course_name}
                      </span>
                      <span className="profile-enrollments__price">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <Tag tone={enrollment.status === "confirmed" ? "green" : "yellow"}>
                      {statusLabel[enrollment.status]}
                    </Tag>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}
