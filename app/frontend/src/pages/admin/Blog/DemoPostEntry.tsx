import { useEffect, useState, type FormEvent } from "react";
import Button from "../Components/Ui/Button";
import { InputField, TextareaField } from "../Components/Ui/FormField";
import Notice from "../Components/Ui/Notice";
import SectionCard from "../Components/Ui/SectionCard";
import useToast from "../Components/Ui/useToast";
import { readDemoPosts, saveDemoPost } from "./demoPosts";
import type { DemoPost } from "./postTypes";
export default function DemoPostEntry({ selector, saved, back }: { selector: string; saved: (post: DemoPost) => void; back: () => void }) {
  const [post, setPost] = useState<DemoPost | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false); const [titleError, setTitleError] = useState(""); const [contentError, setContentError] = useState("");
  const { notify } = useToast();
  useEffect(() => {
    try {
      if (selector !== "new") {
        const item = readDemoPosts().find(item => item.id === Number(selector));
        if (!item) throw new Error("Không tìm thấy bài viết");
        setPost(item); setTitle(item.title); setContent(item.content.join("\n\n"));
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được bài viết."); }
    finally { setLoading(false); }
  }, [selector]);
  const dirty = title !== (post?.title ?? "") || content !== (post?.content.join("\n\n") ?? "");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = button?.value === "Published" ? "Published" : "Draft";
    if (!dirty && post?.status === status) return;
    setTitleError(""); setContentError("");
    if (!title.trim() || title.trim().length > 250) { setTitleError("Tiêu đề bắt buộc, tối đa 250 ký tự."); document.getElementById("demo-post-title")?.focus(); return; }
    if (status === "Published" && !content.trim()) { setContentError("Nội dung không được để trống khi đăng bài."); document.getElementById("demo-post-content")?.focus(); return; }
    setBusy(true);
    try {
      const result = await saveDemoPost(post?.id ?? null, { title, content: content.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean), status });
      setPost(result); setTitle(result.title); setContent(result.content.join("\n\n"));
      notify({ title: status === "Draft" ? "Đã lưu bản nháp minh họa trên trình duyệt." : "Đã lưu bài đã đăng trong dữ liệu minh họa.", tone: "success" });
      saved(result);
    } catch (reason) { notify({ title: reason instanceof Error ? reason.message : "Không lưu được bài viết.", tone: "error" }); }
    finally { setBusy(false); }
  }
  return <div className="admin-content-manager"><Button variant="ghost" icon="chevron-left" onClick={back} disabled={busy}>Quay lại danh sách</Button>
    <SectionCard title={selector === "new" ? "Thêm bài viết" : "Sửa bài viết"}>
      {loading ? <p role="status">Đang tải bài viết…</p> : error ? <Notice tone="error" action={<Button onClick={back}>Về danh sách</Button>}>{error}</Notice> : <form className="admin-panel-form" onSubmit={submit}>
        <p className="admin-api-muted">Bản soạn thử chỉ lưu trên trình duyệt, hỗ trợ nội dung văn bản.</p>
        <InputField id="demo-post-title" label="Tiêu đề" placeholder="Nhập tiêu đề bài viết" value={title} maxLength={250} required disabled={busy} error={titleError} help={`${title.length}/250 ký tự`} onChange={event => setTitle(event.target.value)}/>
        <TextareaField id="demo-post-content" label="Nội dung văn bản" placeholder="Mỗi đoạn cách nhau một dòng trống" rows={10} value={content} disabled={busy} error={contentError} onChange={event => setContent(event.target.value)}/>
        <div className="admin-content-actions"><Button type="submit" name="intent" value="Draft" disabled={(!dirty && post?.status !== "Published") || busy} loading={busy}>Lưu nháp</Button><Button type="submit" name="intent" value="Published" variant="primary" disabled={(!dirty && post?.status !== "Draft") || busy} loading={busy}>{post?.status === "Published" ? "Cập nhật" : "Đăng bài"}</Button></div>
      </form>}
    </SectionCard>
  </div>;
}
