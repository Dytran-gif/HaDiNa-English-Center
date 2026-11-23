import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentApi, useStudentProfile } from "../../../../services/student/useStudentApi";
import { assetUrl } from "../../../../services/apiClient";
import { useLang } from "../../../../i18n/LanguageContext";
import LanguageSwitch from "./LanguageSwitch";
import "./Header.css";

interface HeaderProps {
    onOpenMenu?: () => void; // mobile: mở drawer sidebar
}

function Header({ onOpenMenu }: HeaderProps) {
    const location = useLocation();
    const { t } = useLang();

    // Hồ sơ học viên đang đăng nhập (từ BE)
    const { data: profile, reload: reloadProfile } = useStudentProfile();
    const { replaceToken } = useAuth();
    const api = useStudentApi();

    const displayName = profile?.fullName ?? "";
    const displayEmail = profile?.email ?? "";
    const displayRole = profile?.role ? t(`role.${profile.role.toLowerCase()}`) : "";
    const displayStatus = profile?.status ?? "Studying";
    const statusLabel = t(`status.${displayStatus.toLowerCase()}`);

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
            alert(res.message ?? t("alerts.profileSaved"));
            reloadProfile();
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.profileFailed"));
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert(t("alerts.passwordRequired"));
            return;
        }
        if (newPassword !== confirmPassword) {
            alert(t("alerts.passwordMismatch"));
            return;
        }
        try {
            const res = await api.send<{ message?: string; token?: string }>(
                "POST", "profile/change-password",
                { currentPassword, newPassword, confirmPassword }
            );
            if (res.token) replaceToken(res.token); // giữ phiên đăng nhập với token mới
            alert(res.message ?? t("alerts.passwordChanged"));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsModalOpen(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.passwordFailed"));
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
            alert(res.message ?? t('alerts.avatarChanged'));
        } catch (err) {
            alert(err instanceof Error ? err.message : t('alerts.avatarFailed'));
        } finally {
            setAvatarBusy(false);
        }
    };

    const pageTitleKeys: Record<string, string> = {
        "/student/dashboard": "page.dashboard",
        "/student/courses": "page.courses",
        "/student/schedule": "page.schedule",
        "/student/tuition": "page.tuition",
        "/student/feedback": "page.feedback",
    };

    const title = t(pageTitleKeys[location.pathname] ?? "page.dashboard");

    return (
        <>
            <header className="student-header">
                <button
                    type="button"
                    className="header-menu-btn"
                    onClick={onOpenMenu}
                    aria-label="Open menu"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>

                <div className="header-title">
                    <h1>{title}</h1>
                    <p>
                        {t("header.welcome", { name: displayName })}{" "}
                        <i className="fa-solid fa-hand-sparkles"></i>
                    </p>
                </div>

                <div className="header-right">
                    <LanguageSwitch />

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
                            <h2>{t("profile.title")}</h2>
                            <button className="header-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <div className="header-modal-tabs">
                            <button 
                                className={`header-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}
                            >
                                {t("profile.tabInfo")}
                            </button>
                            <button 
                                className={`header-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                {t("profile.tabPassword")}
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
                                            <i className="fa-solid fa-camera"></i> {avatarBusy ? t('profile.uploading') : t('profile.changeAvatar')}
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
                                                <span className="pf-label"><i className="fa-solid fa-user"></i> {t("profile.fullName")}</span>
                                                <span className="pf-value">{displayName || '—'}</span>
                                            </div>
                                            <div className="pf-item">
                                                <span className="pf-label"><i className="fa-solid fa-user-gear"></i> {t("profile.role")}</span>
                                                <span className="pf-value">{displayRole || '—'}</span>
                                            </div>
                                            <div className="pf-item pf-span-2">
                                                <span className="pf-label"><i className="fa-solid fa-envelope"></i> {t("profile.email")}</span>
                                                <span className="pf-value pf-ellipsis">{displayEmail || '—'}</span>
                                            </div>
                                            <div className="pf-item">
                                                <span className="pf-label"><i className="fa-solid fa-circle-info"></i> {t("profile.status")}</span>
                                                <span className={`pf-badge status-${displayStatus.toLowerCase()}`}>{statusLabel}</span>
                                            </div>
                                            <div className="pf-item">
                                                <span className="pf-label"><i className="fa-solid fa-user-group"></i> {t("profile.parentName")}</span>
                                                <span className="pf-value">{profile?.parentName || '—'}</span>
                                            </div>
                                        </div>

                                        <div className="pf-divider"><span>{t("profile.editSection")}</span></div>

                                        <div className="form-group">
                                            <label>{t("profile.dob")}</label>
                                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>{t("profile.phone")}</label>
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("profile.phonePlaceholder")} />
                                        </div>
                                        <div className="form-group">
                                            <label>{t("profile.address")}</label>
                                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("profile.addressPlaceholder")} />
                                        </div>
                                        <div className="form-group">
                                            <label>{t("profile.parentPhone")}</label>
                                            <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder={t("profile.parentPhonePlaceholder")} />
                                        </div>

                                        <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                                            {saving ? t('profile.saving') : t('profile.save')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="password-form">
                                    <div className="form-group">
                                        <label>{t("profile.currentPassword")}</label>
                                        <input 
                                            type="password" 
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder={t("profile.currentPasswordPh")}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t("profile.newPassword")}</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t("profile.newPasswordPh")}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t("profile.confirmPassword")}</label>
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t("profile.confirmPasswordPh")}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-save">{t("profile.updatePassword")}</button>
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