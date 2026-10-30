export default function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  const columnCount = Math.max(1, Math.floor(columns));
  const rowCount = Math.max(1, Math.floor(rows));
  return <>{Array.from({ length: rowCount }, (_, row) => <tr key={row} className="admin-skeleton-row">{Array.from({ length: columnCount }, (_, column) => <td key={column}>{row === 0 && column === 0 && <span role="status" className="admin-sr-only">Đang tải dữ liệu…</span>}<span className="admin-skeleton-line" aria-hidden="true"/></td>)}</tr>)}</>;
}
