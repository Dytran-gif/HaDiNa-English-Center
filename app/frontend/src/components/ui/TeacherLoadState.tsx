import Button from "./Button";

export default function TeacherLoadState({ loading, error, empty, reload }: { loading: boolean; error: string; empty: boolean; reload: () => void }) {
  if (loading) return <p role="status">Đang tải hồ sơ giáo viên…</p>;
  if (error) return <div role="alert"><p>{error}</p><Button variant="outline" onClick={reload}>Thử lại</Button></div>;
  return empty ? <p>Chưa có hồ sơ giáo viên được công bố.</p> : null;
}
