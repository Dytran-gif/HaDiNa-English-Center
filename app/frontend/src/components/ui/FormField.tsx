import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import "./FormField.css";

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, children }: FieldWrapperProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({ label, error, id, ...rest }: InputFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id ?? label} error={error}>
      <input id={id ?? label} className="field__control" {...rest} />
    </FieldWrapper>
  );
}

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextareaField({
  label,
  error,
  id,
  ...rest
}: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id ?? label} error={error}>
      <textarea
        id={id ?? label}
        className="field__control field__control--textarea"
        {...rest}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  error,
  id,
  options,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id ?? label} error={error}>
      <select id={id ?? label} className="field__control" {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
