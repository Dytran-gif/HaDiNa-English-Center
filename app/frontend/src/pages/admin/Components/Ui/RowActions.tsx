import type { ReactNode } from "react";
import Button from "./Button";
import "./RowActions.css";

type Props = {
  name: string;
  onEdit: () => void;
  onView?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

export default function RowActions({ name, onEdit, onView, onDelete, disabled, children }: Props) {
  return <div className="admin-row-actions admin-resource-actions" role="group" aria-label={`Thao tác: ${name}`}>
    <Button icon="edit" disabled={disabled} aria-label={`Sửa: ${name}`} onClick={onEdit}>Sửa</Button>
    {onView && <Button icon="eye" disabled={disabled} aria-label={`Xem: ${name}`} onClick={onView}>Xem</Button>}
    {onDelete && <Button icon="trash" variant="danger" disabled={disabled} aria-label={`Xóa: ${name}`} onClick={onDelete}>Xóa</Button>}
    {children}
  </div>;
}
