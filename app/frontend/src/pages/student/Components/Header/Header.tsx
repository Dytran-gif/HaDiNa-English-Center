import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentApi, useStudentProfile } from "../../../../services/student/useStudentApi";
import { assetUrl } from "../../../../services/apiClient";
import "./Header.css";

function Header() {
    const location = useLocation();

    // Hồ sơ học viên đang đăng nhập (từ BE)
    const { data: profile, reload: reloadProfile } = useStudentProfile();
    const { replaceToken } = useAuth();
    const api = useStudentApi();

    const displayName = profile?.fullName ?? "";
    const displayEmail = profile?.email ?? "";
    const displayRole = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "";
    const displayStatus = profile?.status ?? "Studying";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Avatar thật: đọc từ Users.AvatarUrl (lưu trên server), state chỉ là ảnh vừa upload phiên này.
    const [uploadedAvatar, setUploadedAvatar] = useState('');
    const [avatarBusy, setAvatarBusy] = useState(false);
    const avatar = uploadedAvatar || assetUrl(profile?.avatarUrl) || '';

    // Các trường học viên được phép tự sửa (đồng bộ lại mỗi khi hồ sơ tải xong)
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setDob(profile?.dateOfBirth ?? '');
        setPhone(profile?.phone ?? '');
        setAddress(profile?.address ?? '');
        setParentPhone(profile?.parentPhone ?? '');
    }, [profile]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await api.send<{ message?: string }>("PUT", "profile", {
                dateOfBirth: dob || null,
                phone,
                address,
                parentPhone
            });
            alert(res.message ?? "Cập nhật hồ sơ thành công!");
            reloadProfile();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Cập nhật hồ sơ thất bại.");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Vui lòng điền đầy đủ thông tin mật khẩu!");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }
        try {
            const res = await api.send<{ message?: string; token?: string }>(
                "POST", "profile/change-password",
                { currentPassword, newPassword, confirmPassword }
            );
            if (res.token) replaceToken(res.token); // giữ phiên đăng nhập với token mới
            alert(res.message ?? "Đổi mật khẩu thành công!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsModalOpen(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Đổi mật khẩu thất bại.");
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // cho phép chọn lại đúng file này sau
        if (!file || avatarBusy) return;

        setAvatarBusy(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await api.upload<{ avatarUrl: string; message?: string }>('profile/avatar', form);
            setUploadedAvatar(assetUrl(res.avatarUrl) ?? res.avatarUrl);
            alert(res.message ?? 'Đổi ảnh đại diện thành công!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đổi ảnh đại diện thất bại.');
        } finally {
            setAvatarBusy(false);
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
                    <p>Welcome to Class, {displayName}! <i className="fa-solid fa-hand-sparkles"></i></p>
                </div>

                <div className="header-right">
                    <div className="header-user" onClick={() => setIsModalOpen(true)}>
                        <div className="user-avatar">
                            {avatar ? <img src={avatar} alt="Avatar" className="avatar-img" /> : "👨‍💻"}
                        </div>

                        <div className="user-info">
                            <strong>{displayName}</strong>
                            <span>{displayEmail}</span>
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
                                            {avatar ? <img src={avatar} alt="Avatar" className="avatar-img-large" /> : "👨‍💻"}
                                        </div>
                                        <label htmlFor="avatar-file" className="btn-upload">
                                            <i className="fa-solid fa-camera"></i> {avatarBusy ? 'Đang tải lên...' : 'Change Avatar'}
                                        </label>
                                        <input 
                                            id="avatar-file" 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleAvatarChange} 
                                            disabled={avatarBusy}
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    <div className="profile-fields">
                                        <div className="pf-grid">
                                            <div className="pf-item">
                                                <span className="pf-label"><i className="fa-solid fa-user"></i> Full Name</span>
                                                <span className="pf-value">{displayName || '—'}</span>
                                            </div>
                                            <div className="pf-item">
                                                <span className="pf-label"><i className="fa-solid fa-user-gear"></i> Role</span>
                                                <span className="pf-value">{displayRole || '—'}</span>
                                            </div>
                                            <div className="pf-item pf-span-2">
                                                <span className="pf-label"><i className="fa-solid fa-envelope"></i> Email</span>
                                                <span className="pf-value pf-ellipsis">{displayEmail || '—'}</span>
                                            </div>
                                            <div className="pf-item">
                                                <span className="pf-label"><i className="fa-solid fa-circle-info"></i> Status</span>
                                                <span className={`pf-badge status-${displayStatus.toLowerCase()}`}>{displayStatus}</span>
                                            </div>
                                            <div className="pf-item">
                                                <span className="pf-label"><i className="fa-solid fa-user-group"></i> Parent Name</span>
                                                <span className="pf-value">{profile?.parentName || '—'}</span>
                                            </div>
                                        </div>

                                        <div className="pf-divider"><span>Thông tin chỉnh sửa</span></div>

                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" />
                                        </div>
                                        <div className="form-group">
                                            <label>Address</label>
                                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ" />
                                        </div>
                                        <div className="form-group">
                                            <label>Parent Phone</label>
                                            <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="SĐT phụ huynh" />
                                        </div>

                                        <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
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