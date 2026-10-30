import { useEffect, useRef, useState } from "react";
import { InputField } from "../Ui/FormField";
export default function SearchField({ label, value, onSearch }: { label: string; value: string; onSearch: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const callback = useRef(onSearch);
  useEffect(() => { callback.current = onSearch; }, [onSearch]);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => callback.current(draft.trim()), 300);
    return () => clearTimeout(timer);
  }, [draft, value]);
  return <InputField label={label} type="search" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); callback.current(draft.trim()); } }} />;
}
