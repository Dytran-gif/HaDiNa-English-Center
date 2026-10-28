import { Link } from "react-router-dom";
import {
  siteName,
  siteTagline,
  offices,
  contactEmail,
  contactPhone,
  footerCoursesNav,
  footerPolicyNav,
  primaryNav,
} from "../../data/siteConfig";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <span className="site-footer__logo">{siteName}</span>
          <p>{siteTagline}</p>
          <div className="site-footer__offices">
            {offices.map((office) => (
              <div key={office.city}>
                <span className="kicker">{office.city}</span>
                {office.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ))}
          </div>
          <p>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            <br />
            <a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a>
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
            {footerCoursesNav.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
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
        <span>© {year} {siteName}</span>
        <span>Đồ án học phần — không phải trang thanh toán thật</span>
      </div>
    </footer>
  );
}
