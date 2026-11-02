import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import { studentUser } from "../../../../data/StudentData/HeaderData";
import "./Header.css";

function Header() {
    const location = useLocation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState(studentUser.avatar);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Vui lòng điền đầy đủ thông tin mật khẩu!");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }
        alert("Đổi mật khẩu thành công!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsModalOpen(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const pageTitles: Record<string, string> = {
        "/student/dashboard": "Dashboard Overview",
        "/student/courses": "Enrollment Courses",
        "/student/schedule": "My Schedule", 
        "/student/tuition": "My Payments",
        "/student/feedback": "Feedback and Support",
    };

    const title = pageTitles[location.pathname] ?? "Dashboard";

    return (
        <>
            <header className="student-header">
                <div className="header-title">
                    <h1>{title}</h1>
                    <p>Welcome to Class, {studentUser.name}! <i className="fa-solid fa-hand-sparkles"></i></p>
                </div>

                <div className="header-right">
                    <div className="header-user" onClick={() => setIsModalOpen(true)}>
                        <div className="user-avatar">
                            {typeof avatar === 'string' && avatar.startsWith('data:') ? (
                                <img src={avatar} alt="Avatar" className="avatar-img" />
                            ) : (
                                avatar
                            )}
                        </div>

                        <div className="user-info">
                            <strong>{studentUser.name}</strong>
                            <span>{studentUser.email}</span>
                        </div>

                        <span className="user-arrow">
                            <i className="fa-regular fa-circle-up fa-flip-vertical"></i>
                        </span>
                    </div>
                </div>
            </header>

            {/* CỬA SỔ NỔI PROFILE (SỬ DỤNG CLASS RIÊNG BIỆT) */}
            {isModalOpen && (
                <div className="header-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="header-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="header-modal-header">
                            <h2>User Profile & Settings</h2>
                            <button className="header-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <div className="header-modal-tabs">
                            <button 
                                className={`header-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}
                            >
                                Personal Info
                            </button>
                            <button 
                                className={`header-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                Change Password
                            </button>
                        </div>

                        <div className="header-modal-body">
                            {activeTab === 'info' ? (
                                <div className="profile-info-section">
                                    <div className="avatar-upload-box">
                                        <div className="preview-avatar">
                                            {typeof avatar === 'string' && avatar.startsWith('data:') ? (
                                                <img src={avatar} alt="Avatar" className="avatar-img-large" />
                                            ) : (
                                                avatar
                                            )}
                                        </div>
                                        <label htmlFor="avatar-file" className="btn-upload">
                                            <i className="fa-solid fa-camera"></i> Change Avatar
                                        </label>
                                        <input 
                                            id="avatar-file" 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleAvatarChange} 
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    <div className="info-details">
                                        <div className="info-row">
                                            <span>Full Name:</span>
                                            <strong>{studentUser.name}</strong>
                                        </div>
                                        <div className="info-row">
                                            <span>Email:</span>
                                            <strong>{studentUser.email}</strong>
                                        </div>
                                        <div className="info-row">
                                            <span>Role:</span>
                                            <strong>Student</strong>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="password-form">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input 
                                            type="password" 
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-save">Update Password</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;