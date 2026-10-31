
import { courseFeaturesData } from '../../../../data/StudentData/OtherData';
import './CourseSidebar.css';
import BookBanner from "../../../../assets/images/BookBanner.png";

export default function CourseSidebarFE() {
    return (
        <aside className="course-sidebar-section">
            {/* Banner 1: Top */}
            <div className="cs-banner cs-banner-top">
                <div className="cs-banner-text">
                    <h3>Better English<br/>Brighter Future <i className="fa-solid fa-arrow-trend-up"></i></h3>
                </div>
                <img src={BookBanner} alt="Books illustration" className="cs-banner-img" />
            </div>

            {/* Khung tính năng (Giữ nguyên như cũ) */}
            <div className="cs-feature-card">
                <h2 className="cs-title">Why Choose Our Courses?</h2>
                <div className="cs-list">
                    {courseFeaturesData.map((feature) => (
                        <div key={feature.id} className="cs-item">
                            <div className="cs-icon-box">
                                <i className={feature.icon}></i>
                            </div>
                            <div className="cs-content">
                                <h4 className="cs-item-title">{feature.title}</h4>
                                <p className="cs-item-desc">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            
        </aside>
    );
}