import type { ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
    title: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}

export default function Modal({ title, open, onClose, children, footer }: ModalProps) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
                        ✕
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
