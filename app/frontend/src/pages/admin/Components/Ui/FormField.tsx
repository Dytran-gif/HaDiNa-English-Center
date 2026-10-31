import { useId, useState, type ComponentProps } from "react";
import { InputField as BaseInput, SelectField as BaseSelect, TextareaField as BaseTextarea } from "../../../../components/ui/FormField";
import { IconButton } from "./Button";
type Extras = { help?: string; loading?: boolean };
export function InputField({ id, type, error, help, loading, disabled, ...props }: ComponentProps<typeof BaseInput> & Extras) {
  const generated = useId(); const fieldId = id ?? generated; const [visible, setVisible] = useState(false);
  const password = type === "password";
  const description = [error ? `${fieldId}-error` : "", help ? `${fieldId}-help` : "", props["aria-describedby"] ?? ""].filter(Boolean).join(" ") || undefined;
  return <div className={`admin-field ${password ? "admin-password-field" : ""}`}>
    <BaseInput {...props} id={fieldId} type={password && visible ? "text" : type} disabled={disabled || loading} aria-busy={loading || undefined} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={description}/>
    {password && <IconButton className="admin-password-toggle" variant="ghost" icon={visible ? "eye-off" : "eye"} label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-controls={fieldId} aria-pressed={visible} disabled={disabled || loading} onClick={() => setVisible(value => !value)}/>}
    {error && <p id={`${fieldId}-error`} className="field__error">{error}</p>}
    {help && <p id={`${fieldId}-help`} className="admin-field-help">{help}</p>}
  </div>;
}
export function SelectField({ id, help, error, loading, disabled, ...props }: ComponentProps<typeof BaseSelect> & Extras) {
  const generated = useId(); const fieldId = id ?? generated;
  return <div className="admin-field"><BaseSelect {...props} id={fieldId} disabled={disabled || loading} aria-busy={loading || undefined} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={[error ? `${fieldId}-error` : "", help ? `${fieldId}-help` : "", props["aria-describedby"] ?? ""].filter(Boolean).join(" ") || undefined}/>{error && <p id={`${fieldId}-error`} className="field__error">{error}</p>}{help && <p id={`${fieldId}-help`} className="admin-field-help">{help}</p>}</div>;
}
export function TextareaField({ id, help, error, loading, disabled, ...props }: ComponentProps<typeof BaseTextarea> & Extras) {
  const generated = useId(); const fieldId = id ?? generated;
  return <div className="admin-field"><BaseTextarea {...props} id={fieldId} disabled={disabled || loading} aria-busy={loading || undefined} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={[error ? `${fieldId}-error` : "", help ? `${fieldId}-help` : "", props["aria-describedby"] ?? ""].filter(Boolean).join(" ") || undefined}/>{error && <p id={`${fieldId}-error`} className="field__error">{error}</p>}{help && <p id={`${fieldId}-help`} className="admin-field-help">{help}</p>}</div>;
}
