// Chạy tự động trước `npm run dev` / `npm run build` (predev, prebuild).
// So mã băm package-lock.json với lần cài trước; khác (hoặc chưa có node_modules) thì tự `npm install`.
// Nhờ vậy pull code có thư viện mới về chỉ cần chạy lại `npm run dev`.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lock = join(root, "package-lock.json");
const stamp = join(root, "node_modules", ".deps-hash");
const hashOf = () => createHash("sha1").update(readFileSync(lock)).digest("hex");

if (existsSync(stamp) && readFileSync(stamp, "utf8").trim() === hashOf()) process.exit(0);

// npm ci cài đúng theo package-lock và KHÔNG sửa package-lock (tránh tạo thay đổi git trên máy teammate).
// Lock lệch package.json thì npm ci báo lỗi -> lùi về npm install.
console.log("[ensure-deps] Thư viện thay đổi hoặc chưa cài -> đang cài (npm ci)…");
try { execSync("npm ci --no-audit --no-fund", { cwd: root, stdio: "inherit" }); }
catch { execSync("npm install --no-audit --no-fund", { cwd: root, stdio: "inherit" }); }
writeFileSync(stamp, hashOf()); // npm install có thể ghi lại package-lock -> băm sau khi cài
