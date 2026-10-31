import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button, { IconButton } from "../Components/Ui/Button";
import Badge from "../Components/Ui/Badge";
import Icon from "../Components/Ui/Icon";
import Notice from "../Components/Ui/Notice";
import ConfirmDialog from "../Components/Ui/ConfirmDialog";
import Dialog from "../Components/Ui/Dialog";
import EmptyState from "../Components/Ui/EmptyState";
import Pagination from "../Components/Ui/Pagination";
import TableSkeleton from "../Components/Ui/TableSkeleton";
import { SelectField } from "../Components/Ui/FormField";
import useToast from "../Components/Ui/useToast";
import SearchField from "../Components/Api/SearchField";
import placeholder from "../Components/Ui/assets/post-placeholder.svg";
import { deleteDemoPost, listDemoPosts } from "./demoPosts";
import type { DemoPost, DemoPostPage } from "./postTypes";
import DemoPostEntry from "./DemoPostEntry";
import PostTextPreview from "./PostTextPreview";
import "../admin-shared.css";
import "../Components/Ui/AdminContent.css";

export default function BlogManagement() {
  const [params, setParams] = useSearchParams(); const { notify } = useToast();
  const search = params.get("search") ?? "";
  const status = ["Draft", "Published"].includes(params.get("status") ?? "") ? params.get("status")! : "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const compose = params.get("compose");
  const [result, setResult] = useState<DemoPostPage>(); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [revision, setRevision] = useState(0); const [deleting, setDeleting] = useState<DemoPost | null>(null); const [preview, setPreview] = useState<DemoPost | null>(null);
  useEffect(() => {
    let active = true; setLoading(true); setError("");
    listDemoPosts({ search, status, page, pageSize: 10 }).then(data => { if (active) setResult(data); }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được bài viết."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, status, page, revision]);
  function changeQuery(key: string, value: string) {
    setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); if (key !== "page") next.set("page", "1"); return next; });
  }
  function composePost(id: number | "new") { setParams(previous => { const next = new URLSearchParams(previous); next.set("compose", String(id)); return next; }); }
  function back() { setParams(previous => { const next = new URLSearchParams(previous); next.delete("compose"); return next; }); }
  async function remove() {
    if (!deleting) return;
    await deleteDemoPost(deleting.id);
    setRevision(value => value + 1);
    notify({ title: "Đã xóa bài viết minh họa trên trình duyệt.", tone: "success" });
  }
  const addButton = <Button variant="primary" icon="plus" onClick={() => composePost("new")}>Thêm bài viết</Button>;
  if (compose) return <DemoPostEntry key={compose} selector={compose} back={back} saved={post => { setRevision(value => value + 1); if (post.status === "Published") back(); else composePost(post.id); }}/>;
  const filtered = Boolean(search || status);
  return <div className="admin-content-manager">
    <div className="admin-content-toolbar"><div><h2>Danh sách bài viết</h2><p>{loading ? "Đang tải danh sách…" : error ? "Chưa tải được dữ liệu" : `${result?.total ?? 0} bài viết`}</p></div>{addButton}</div>
    <div className="admin-content-filters"><div className="admin-content-search"><Icon name="search"/><SearchField label="Tìm theo tiêu đề" placeholder="Nhập tiêu đề bài viết…" value={search} onSearch={value => changeQuery("search", value)}/></div><SelectField label="Trạng thái" value={status} onChange={event => changeQuery("status", event.target.value)} options={[{value:"",label:"Tất cả"},{value:"Published",label:"Đã đăng"},{value:"Draft",label:"Nháp"}]}/><Button icon="refresh" loading={loading} onClick={() => setRevision(value => value + 1)}>Tải lại</Button></div>
    {error && <Notice tone="error" action={<Button icon="refresh" onClick={() => setRevision(value => value + 1)}>Thử lại</Button>}>{error}</Notice>}
    <Card padded={false}><div className="admin-content-table" role="region" aria-label="Danh sách bài viết" tabIndex={0}><table className="admin-table"><thead><tr><th>Ảnh bìa</th><th>Tiêu đề</th><th>Danh mục</th><th>Trạng thái</th><th>Ngày đăng</th><th>Thao tác</th></tr></thead><tbody>
      {loading ? <TableSkeleton columns={6}/> : error ? <tr><td colSpan={6}><EmptyState title="Chưa tải được bài viết" description="Dữ liệu cục bộ vẫn được giữ nguyên. Hãy thử tải lại."/></td></tr> : !result?.items.length ? <tr><td colSpan={6}><EmptyState title={filtered ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết nào"} description={filtered ? "Thử một từ khóa khác hoặc xóa bộ lọc để xem tất cả." : "Tạo bài viết đầu tiên để bắt đầu quản lý nội dung."} action={filtered ? <Button onClick={() => setParams({})}>Xóa bộ lọc</Button> : addButton}/></td></tr> : result.items.map(post => <tr key={post.id}>
        <td><img className="admin-post-thumbnail" src={post.thumbnailUrl ?? placeholder} alt={`Ảnh bìa: ${post.title}`} loading="lazy" onError={event => { if (event.currentTarget.getAttribute("src") !== placeholder) event.currentTarget.src = placeholder; }}/></td>
        <td><span className="admin-post-title" title={post.title}>{post.title}</span></td>
        <td>{post.legacyCategory ? <Badge tone="neutral">{post.legacyCategory}</Badge> : "—"}</td>
        <td><Badge status={post.status}/></td>
        <td className="admin-content-date">{post.status === "Published" && post.publishedAt ? post.publishedAt.split("-").reverse().join("/") : "—"}</td>
        <td><div className="admin-content-actions"><IconButton icon="edit" label={`Sửa bài: ${post.title}`} onClick={() => composePost(post.id)}/><IconButton icon="eye" label={`Xem trước bài: ${post.title}`} onClick={() => setPreview(post)}/><IconButton icon="trash" label={`Xóa bài: ${post.title}`} variant="ghost" onClick={() => setDeleting(post)}/></div></td>
      </tr>)}
    </tbody></table></div></Card>
    <Pagination page={result?.page ?? page} total={result?.total ?? 0} itemLabel="bài viết" loading={loading || Boolean(error)} onChange={value => changeQuery("page", String(value))}/>
    <ConfirmDialog open={Boolean(deleting)} title="Xóa bài viết" confirmLabel="Xóa bài viết" onClose={() => setDeleting(null)} onConfirm={remove} onFailure={reason => { setDeleting(null); notify({ title: reason instanceof Error ? reason.message : "Không xóa được bài viết.", tone: "error" }); }}><p>Bạn có muốn xóa bài “{deleting?.title}” khỏi dữ liệu minh họa trên trình duyệt?</p></ConfirmDialog>
    <Dialog open={Boolean(preview)} title="Bản xem trước · văn bản minh họa" onClose={() => setPreview(null)}>{preview && <PostTextPreview post={preview}/>}</Dialog>
  </div>;
}
