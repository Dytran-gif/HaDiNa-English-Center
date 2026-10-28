import { useState } from "react";

// Hook dùng chung cho các trang CRUD (Admin/Teacher) khi chưa có backend thật.
// Dữ liệu khởi tạo từ mock data (seed), sau đó lưu vào localStorage để các
// thao tác thêm/sửa/xóa được giữ lại giữa các lần load trang.
// TODO: khi có backend thật, thay bằng gọi API và xóa hook này.
export function useLocalCollection<T>(storageKey: string, seed: T[]) {
    const [items, setItemsState] = useState<T[]>(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            return raw ? (JSON.parse(raw) as T[]) : seed;
        } catch {
            return seed;
        }
    });

    function persist(next: T[]) {
        setItemsState(next);
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            // localStorage đầy hoặc không khả dụng — bỏ qua, giữ state trong bộ nhớ
        }
    }

    function add(item: T) {
        persist([...items, item]);
    }

    function update(predicate: (item: T) => boolean, updater: (item: T) => T) {
        persist(items.map((it) => (predicate(it) ? updater(it) : it)));
    }

    function remove(predicate: (item: T) => boolean) {
        persist(items.filter((it) => !predicate(it)));
    }

    function resetToSeed() {
        localStorage.removeItem(storageKey);
        setItemsState(seed);
    }

    return { items, setItems: persist, add, update, remove, resetToSeed };
}

// Sinh id tăng dần đơn giản dựa trên id lớn nhất hiện có + 1 (chỉ dùng cho mock demo).
export function nextId<T>(items: T[], getId: (item: T) => number): number {
    return items.reduce((max, it) => Math.max(max, getId(it)), 0) + 1;
}
