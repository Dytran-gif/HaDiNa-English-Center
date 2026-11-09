import { useEffect, useRef, useState } from "react";
import { InputField } from "../Ui/FormField";
export default function SearchField({ label, value, placeholder, onSearch, disabled = false }: { label: string; value: string; placeholder?: string; onSearch: (value: string) => void; disabled?: boolean }) {
  const [draft, setDraft] = useState(value);
  const callback = useRef(onSearch);
  useEffect(() => { callback.current = onSearch; }, [onSearch]);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (disabled || draft === value) return;
    const timer = setTimeout(() => callback.current(draft.trim()), 300);
    return () => clearTimeout(timer);
  }, [draft, value, disabled]);
  return <InputField label={label} placeholder={placeholder} disabled={disabled} type="search" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); callback.current(draft.trim()); } }} />;
}
