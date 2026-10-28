import { useState } from "react";
import "../admin-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField, TextareaField } from "../../../components/ui/FormField";
import { blogPosts as blogSeed } from "../../../data/blogPosts";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { BlogPost } from "../../../types";

const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

const categoryOptions = [
    "Tips luyện thi - du học",
    "IELTS Reading",
    "IELTS Speaking",
    "IELTS Writing",
    "Ngữ pháp",
    "Tin tức trung tâm",
];

type FormState = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    published_at: string;
};

function emptyForm(): FormState {
    return {
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: categoryOptions[0],
        published_at: new Date().toISOString().slice(0, 10),
    };
}

export default function BlogManagement() {
    const { items: posts, add, update, remove } = useLocalCollection<BlogPost>(
        "admin_blog",
        blogSeed
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm());

    function openAddModal() {
        setEditingId(null);
        setForm(emptyForm());
        setModalOpen(true);
    }

    function openEditModal(post: BlogPost) {
        setEditingId(post.post_id);
        setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content.join("\n\n"),
            category: post.category,
            published_at: post.published_at,
        });
        setModalOpen(true);
    }

    function handleDelete(postId: number) {
        if (!window.confirm("Xóa bài viết này? Hành động không thể hoàn tác.")) return;
        remove((p) => p.post_id === postId);
    }

    function handleSubmit() {
        if (!form.title.trim() || !form.slug.trim()) {
            window.alert("Vui lòng nhập tiêu đề và slug.");
            return;
        }

        const contentParagraphs = form.content
            .split("\n\n")
            .map((p) => p.trim())
            .filter(Boolean);

        if (editingId !== null) {
            update(
                (p) => p.post_id === editingId,
                (p) => ({
                    ...p,
                    title: form.title,
                    slug: form.slug,
                    excerpt: form.excerpt,
                    content: contentParagraphs,
                    category: form.category,
                    published_at: form.published_at,
                })
            );
        } else {
            const newPost: BlogPost = {
                post_id: nextId(posts, (p) => p.post_id),
                title: form.title,
                slug: form.slug,
                excerpt: form.excerpt,
                content: contentParagraphs,
                category: form.category,
                published_at: form.published_at,
            };
            add(newPost);
        }
        setModalOpen(false);
    }

    return (
        <div className="admin-table-page">
            <div className="admin-table-toolbar">
                <p className="admin-table-count">{posts.length} bài viết</p>
                <Button variant="primary" onClick={openAddModal}>
                    + Thêm bài viết
                </Button>
            </div>

            <Card>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Danh mục</th>
                            <th>Ngày đăng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.post_id}>
                                <td>{post.title}</td>
                                <td>{post.category}</td>
                                <td>{formatter.format(new Date(post.published_at))}</td>
                                <td>
                                    <div className="admin-row-actions">
                                        <button type="button" className="admin-action-link" onClick={() => openEditModal(post)}>
                                            Sửa
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-action-link admin-action-danger"
                                            onClick={() => handleDelete(post.post_id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="admin-table-empty">
                                    Chưa có bài viết nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                title={editingId !== null ? "Sửa bài viết" : "Thêm bài viết mới"}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingId !== null ? "Lưu thay đổi" : "Thêm bài viết"}
                        </Button>
                    </>
                }
            >
                <InputField label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <InputField label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                <TextareaField
                    label="Tóm tắt"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                />
                <TextareaField
                    label="Nội dung (mỗi đoạn cách nhau 1 dòng trống)"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={5}
                />
                <SelectField
                    label="Danh mục"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    options={categoryOptions.map((c) => ({ value: c, label: c }))}
                />
                <InputField
                    label="Ngày đăng"
                    type="date"
                    value={form.published_at}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                />
            </Modal>
        </div>
    );
}
