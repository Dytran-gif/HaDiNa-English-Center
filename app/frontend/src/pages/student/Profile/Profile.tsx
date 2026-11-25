import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from "react-router-dom";
import "../General.css";
import "./Profile.css";
import { useAuth } from "../../../context/AuthContext";
import { useStudentApi, useStudentProfile } from "../../../services/student/useStudentApi";
import { assetUrl } from "../../../services/apiClient";
import { useLang } from "../../../i18n/LanguageContext";

const AVATAR_MAX_MB = 5;

// SĐT: đủ 10 số, bắt đầu bằng 0; sai thì báo đỏ + chặn Save
const PHONE_RE = /^0\d{9}$/;

type Notice = { tone: 'ok' | 'err'; text: string } | null;

function Field({
    label, icon, value, onChange, type = 'text', placeholder, disabled, error, inputMode,
}: {
    label: string;
    icon: string;
    value: string;
    onChange?: (v: string) => void;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    inputMode?: "numeric" | "tel" | "text";
}) {
    return (
        <label className="sp-field">
            <span className="sp-field-label">
                <i className={icon}></i> {label}
            </span>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                inputMode={inputMode}
                aria-invalid={Boolean(error)}
                className={error ? 'invalid' : undefined}
                onChange={(e) => onChange?.(e.target.value)}
            />
            {error && <span className="sp-field-error">{error}</span>}
        </label>
    );
}

function ProfilePage() {
    const { t } = useLang();
    const api = useStudentApi();
    const { replaceToken } = useAuth();
    const { data: profile, loading, error, reload } = useStudentProfile();

    const [uploadedAvatar, setUploadedAvatar] = useState('');
    const [avatarBusy, setAvatarBusy] = useState(false);
    const avatarFileRef = useRef<HTMLInputElement>(null);
    const avatar = uploadedAvatar || assetUrl(profile?.avatarUrl) || '';
    const initials = (profile?.fullName ?? '')
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

    // --- Thông tin liên hệ (học viên tự sửa) ---
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [savingContact, setSavingContact] = useState(false);
    const [contactNotice, setContactNotice] = useState<Notice>(null);

    useEffect(() => {
        setDob(profile?.dateOfBirth ?? '');
        setPhone(profile?.phone ?? '');
        setAddress(profile?.address ?? '');
        setParentPhone(profile?.parentPhone ?? '');
        setContactNotice(null);
    }, [profile]);

    const contactDirty = Boolean(profile) && (
        dob !== (profile?.dateOfBirth ?? '')
        || phone !== (profile?.phone ?? '')
        || address !== (profile?.address ?? '')
        || parentPhone !== (profile?.parentPhone ?? '')
    );

    // Rỗng = xóa số; có nội dung thì phải đủ 10 số, bắt đầu bằng 0
    const phoneErr = phone && !PHONE_RE.test(phone) ? t("profile.phoneInvalid") : '';
    const parentPhoneErr = parentPhone && !PHONE_RE.test(parentPhone) ? t("profile.phoneInvalid") : '';

    const saveContact = async (e: FormEvent) => {
        e.preventDefault();
        if (!profile || savingContact || !contactDirty) return;
        if (phoneErr || parentPhoneErr) {
            setContactNotice({ tone: 'err', text: t("profile.phoneInvalid") });
            return;
        }
        setSavingContact(true);
        setContactNotice(null);
        try {
            const res = await api.send<{ message?: string }>("PUT", "profile", {
                dateOfBirth: dob || null,
                phone,
                address,
                parentPhone
            });
            setContactNotice({ tone: 'ok', text: res.message ?? t("alerts.profileSaved") });
            reload();
        } catch (err) {
            setContactNotice({ tone: 'err', text: err instanceof Error ? err.message : t("alerts.profileFailed") });
        } finally {
            setSavingContact(false);
        }
    };

    // --- Ảnh đại diện ---
    const uploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || avatarBusy) return;
        if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
            setContactNotice({ tone: 'err', text: t("profile.avatarTooLarge", { max: AVATAR_MAX_MB }) });
            return;
        }
        setAvatarBusy(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await api.upload<{ avatarUrl: string; message?: string }>('profile/avatar', form);
            setUploadedAvatar(assetUrl(res.avatarUrl) ?? res.avatarUrl);
            reload();
        } catch (err) {
            setContactNotice({ tone: 'err', text: err instanceof Error ? err.message : t('alerts.avatarFailed') });
        } finally {
            setAvatarBusy(false);
        }
    };

    // --- Mật khẩu ---
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwBusy, setPwBusy] = useState(false);
    const [pwNotice, setPwNotice] = useState<Notice>(null);

    const changePassword = async (e: FormEvent) => {
        e.preventDefault();
        if (pwBusy) return;
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPwNotice({ tone: 'err', text: t("alerts.passwordRequired") });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwNotice({ tone: 'err', text: t("alerts.passwordMismatch") });
            return;
        }
        setPwBusy(true);
        setPwNotice(null);
        try {
            const res = await api.send<{ message?: string; token?: string }>(
                "POST", "profile/change-password",
                { currentPassword, newPassword, confirmPassword }
            );
            if (res.token) replaceToken(res.token);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPwNotice({ tone: 'ok', text: res.message ?? t("alerts.passwordChanged") });
        } catch (err) {
            setPwNotice({ tone: 'err', text: err instanceof Error ? err.message : t("alerts.passwordFailed") });
        } finally {
            setPwBusy(false);
        }
    };

    if (loading && !profile) {
        return (
            <div className="container sp-page">
                <div className="sp-loading" role="status">
                    <i className="fa-solid fa-circle-notch fa-spin"></i> {t("profile.loading")}
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="container sp-page">
                <div className="sp-error" role="alert">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>{error || t("profile.notFound")}</span>
                    <button type="button" onClick={reload}>{t("profile.retry")}</button>
                </div>
            </div>
        );
    }

    const roleLabel = profile.role ? t(`role.${profile.role.toLowerCase()}`) : '—';
    const status = (profile.status ?? 'Studying');
    const statusLabel = t(`status.${status.toLowerCase()}`);

    return (
        <div className="container sp-page">
            <section className="sp-hero">
                <span className="sp-hero-icon"><i className="fa-regular fa-id-card"></i></span>
                <div className="sp-hero-text">
                    <h1>{t("page.profile")}</h1>
                    <p>{t("profile.subtitle")}</p>
                </div>
                <Link to="/student/dashboard" className="sp-hero-back">
                    <i className="fa-solid fa-arrow-left"></i> {t("profile.back")}
                </Link>
            </section>

            <div className="sp-grid">
                {/* ============ TRÁI ============ */}
                <div className="sp-col">
                    <article className="sp-card sp-identity">
                        <div className="sp-avatar-box">
                            <div className="sp-avatar">
                                {avatar
                                    ? <img src={avatar} alt={profile.fullName} />
                                    : <span>{initials || <i className="fa-solid fa-user"></i>}</span>}
                            </div>
                            <button
                                type="button"
                                className="sp-avatar-btn"
                                onClick={() => avatarFileRef.current?.click()}
                                disabled={avatarBusy}
                            >
                                <i className={`fa-solid ${avatarBusy ? 'fa-circle-notch fa-spin' : 'fa-camera'}`}></i>
                                {avatarBusy ? t('profile.uploading') : t('profile.changeAvatar')}
                            </button>
                            <input
                                ref={avatarFileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={uploadAvatar}
                                disabled={avatarBusy}
                                hidden
                            />
                        </div>

                        <div className="sp-identity-main">
                            <h2>{profile.fullName || '—'}</h2>
                            <div className="sp-chips">
                                <span className="sp-chip sp-chip-role">
                                    <i className="fa-solid fa-user-gear"></i> {roleLabel}
                                </span>
                                <span className={`sp-chip sp-chip-status status-${status.toLowerCase()}`}>
                                    <i className="fa-solid fa-circle-dot"></i> {statusLabel}
                                </span>
                            </div>
                            <p className="sp-identity-mail">
                                <i className="fa-regular fa-envelope"></i> {profile.email}
                            </p>
                        </div>
                    </article>

                    <article className="sp-card">
                        <header className="sp-card-head">
                            <h3><i className="fa-regular fa-address-card"></i> {t("profile.editTitle")}</h3>
                        </header>

                        <form className="sp-form" onSubmit={saveContact}>
                            {contactNotice && (
                                <div className={`sp-notice ${contactNotice.tone}`} role="status">
                                    <i className={`fa-solid ${contactNotice.tone === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                                    {contactNotice.text}
                                </div>
                            )}

                            <div className="sp-form-grid">
                                <Field
                                    label={t("profile.dob")}
                                    icon="fa-regular fa-calendar"
                                    type="date"
                                    value={dob}
                                    onChange={setDob}
                                    disabled={savingContact}
                                />
                                <Field
                                    label={t("profile.phone")}
                                    icon="fa-solid fa-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={setPhone}
                                    placeholder={t("profile.phonePlaceholder")}
                                    disabled={savingContact}
                                    error={phoneErr}
                                    inputMode="numeric"
                                />
                                <Field
                                    label={t("profile.address")}
                                    icon="fa-solid fa-location-dot"
                                    value={address}
                                    onChange={setAddress}
                                    placeholder={t("profile.addressPlaceholder")}
                                    disabled={savingContact}
                                />
                                <Field
                                    label={t("profile.parentPhone")}
                                    icon="fa-solid fa-phone-volume"
                                    type="tel"
                                    value={parentPhone}
                                    onChange={setParentPhone}
                                    placeholder={t("profile.parentPhonePlaceholder")}
                                    disabled={savingContact}
                                    error={parentPhoneErr}
                                    inputMode="numeric"
                                />
                            </div>

                            <div className="sp-form-actions">
                                <button
                                    type="button"
                                    className="sp-btn ghost"
                                    disabled={savingContact || !contactDirty}
                                    onClick={() => {
                                        setDob(profile.dateOfBirth ?? '');
                                        setPhone(profile.phone ?? '');
                                        setAddress(profile.address ?? '');
                                        setParentPhone(profile.parentPhone ?? '');
                                        setContactNotice(null);
                                    }}
                                >
                                    {t("profile.reset")}
                                </button>
                                <button type="submit" className="sp-btn primary" disabled={savingContact || !contactDirty || Boolean(phoneErr || parentPhoneErr)}>
                                    <i className="fa-solid fa-floppy-disk"></i>
                                    {savingContact ? t('profile.saving') : t('profile.save')}
                                </button>
                            </div>
                        </form>
                    </article>
                </div>

                {/* ============ PHẢI ============ */}
                <div className="sp-col">
                    <article className="sp-card">
                        <header className="sp-card-head">
                            <h3><i className="fa-solid fa-shield-halved"></i> {t("profile.accountTitle")}</h3>
                            <p>{t("profile.accountDesc")}</p>
                        </header>

                        <dl className="sp-rows">
                            <div className="sp-row">
                                <dt><i className="fa-solid fa-user"></i> {t("profile.fullName")}</dt>
                                <dd>{profile.fullName || '—'}</dd>
                            </div>
                            <div className="sp-row">
                                <dt><i className="fa-solid fa-hashtag"></i> {t("profile.studentCode")}</dt>
                                <dd>{profile.code}</dd>
                            </div>
                            <div className="sp-row">
                                <dt><i className="fa-regular fa-envelope"></i> {t("profile.email")}</dt>
                                <dd className="sp-ellipsis">{profile.email}</dd>
                            </div>
                            <div className="sp-row">
                                <dt><i className="fa-solid fa-user-group"></i> {t("profile.parentName")}</dt>
                                <dd>{profile.parentName || '—'}</dd>
                            </div>
                        </dl>
                    </article>

                    <article className="sp-card">
                        <header className="sp-card-head">
                            <h3><i className="fa-solid fa-key"></i> {t("profile.changePassword")}</h3>
                            <p>{t("profile.changePasswordDesc")}</p>
                        </header>

                        <form className="sp-form" onSubmit={changePassword}>
                            {pwNotice && (
                                <div className={`sp-notice ${pwNotice.tone}`} role="status">
                                    <i className={`fa-solid ${pwNotice.tone === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                                    {pwNotice.text}
                                </div>
                            )}

                            <Field
                                label={t("profile.currentPassword")}
                                icon="fa-solid fa-lock"
                                type="password"
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                placeholder={t("profile.currentPasswordPh")}
                                disabled={pwBusy}
                            />
                            <Field
                                label={t("profile.newPassword")}
                                icon="fa-solid fa-key"
                                type="password"
                                value={newPassword}
                                onChange={setNewPassword}
                                placeholder={t("profile.newPasswordPh")}
                                disabled={pwBusy}
                            />
                            <Field
                                label={t("profile.confirmPassword")}
                                icon="fa-solid fa-rotate"
                                type="password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                placeholder={t("profile.confirmPasswordPh")}
                                disabled={pwBusy}
                            />

                            <div className="sp-form-actions">
                                <button type="submit" className="sp-btn primary wide" disabled={pwBusy}>
                                    <i className="fa-solid fa-shield-halved"></i>
                                    {pwBusy ? t('profile.saving') : t('profile.updatePassword')}
                                </button>
                            </div>
                        </form>
                    </article>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
