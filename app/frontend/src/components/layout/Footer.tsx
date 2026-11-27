import { Link } from "react-router-dom";
import {
  siteName,
  siteTagline,
  contactEmail,
  footerPolicyNav,
  primaryNav,
} from "../../data/siteConfig";
import "./Footer.css";
import useCenterSettings from "../../services/useCenterSettings";
import usePublicCourses from "../../services/usePublicCourses";

export default function Footer() {
  const { courses } = usePublicCourses();
  const year = new Date().getFullYear();
  const { center, loading, error, reload } = useCenterSettings();
  const name = center?.name ?? siteName;

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <span className="site-footer__logo">{name}</span>
          <p>{siteTagline}</p>
          <div className="site-footer__offices">
            {center?.address && <p>{center.address}</p>}
            {loading && !center && <p role="status">Đang tải thông tin trung tâm…</p>}
            {error && <p>Không tải được thông tin mới. <button type="button" onClick={() => { void reload(); }}>Thử lại</button></p>}
          </div>
          <p>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            <br />
            {center?.phone && <a href={`tel:${center.phone.replace(/[^+\d]/g, "")}`}>{center.phone}</a>}
          </p>
        </div>

        <div className="site-footer__col">
          <h4>Trang</h4>
          <ul>
            {primaryNav.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h4>Khoá học</h4>
          <ul>
            {courses.map((course) => (
              <li key={course.course_id}>
                <Link to={`/khoa-hoc/${course.slug}`}>{course.course_name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h4>Chính sách</h4>
          <ul>
            {footerPolicyNav.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom container">
        <span>© {year} {name}</span>
        <span>Đồ án học phần — không phải trang thanh toán thật</span>
      </div>
    </footer>
  );
}
