import { useLang } from "../../../../i18n/LanguageContext";

// Nút trượt chuyển ngôn ngữ VI <-> EN (thumb trượt mượt, lựa chọn lưu localStorage)
export default function LanguageSwitch() {
    const { lang, setLang } = useLang();

    return (
        <div className="lang-switch" role="group" aria-label="Language / Ngôn ngữ">
            <span className={`lang-switch-thumb ${lang}`} aria-hidden="true"></span>
            <button
                type="button"
                className={`lang-option ${lang === "en" ? "active" : ""}`}
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                title="English"
            >
                EN
            </button>
            <button
                type="button"
                className={`lang-option ${lang === "vi" ? "active" : ""}`}
                onClick={() => setLang("vi")}
                aria-pressed={lang === "vi"}
                title="Tiếng Việt"
            >
                VI
            </button>
        </div>
    );
}