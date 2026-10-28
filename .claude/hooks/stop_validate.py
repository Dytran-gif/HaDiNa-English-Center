#!/usr/bin/env python3
"""Stop hook: cổng kiểm tra (validation gate) trước khi agent được kết thúc lượt.

- Nếu stop_hook_active = True (đã chặn một lần rồi) thì cho qua, tránh vòng lặp vô hạn.
- Chỉ kiểm tra phần CÓ THAY ĐỔI (theo `git status`):
    app/frontend/ đổi -> npm run lint && npm run typecheck
    app/backend/  đổi -> dotnet build
  Không phải git repo -> kiểm tra cả hai.
- Lỗi thì in JSON {"decision": "block", "reason": ...} để agent sửa tiếp.
- Thiếu công cụ (npm/dotnet) thì bỏ qua phần đó và ghi cảnh báo ra stderr, không chặn.

Gắn vào: Stop
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], cwd: Path) -> tuple[bool, str]:
    exe = shutil.which(cmd[0])
    if not exe:
        return True, f"(bỏ qua: không thấy '{cmd[0]}' trên PATH)"
    r = subprocess.run([exe, *cmd[1:]], cwd=str(cwd), capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    out = ((r.stdout or "") + (r.stderr or "")).strip()
    lines = [line for line in out.splitlines() if line.strip()]
    return r.returncode == 0, "\n".join(lines[-20:]) if lines else "(không có output)"


def changed_areas(project_dir: Path) -> set[str]:
    git = shutil.which("git")
    if not git:
        return {"frontend", "backend"}
    r = subprocess.run([git, "status", "--porcelain", "--untracked-files=all"],
                       cwd=str(project_dir), capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:  # không phải git repo
        return {"frontend", "backend"}
    areas: set[str] = set()
    for line in r.stdout.splitlines():
        path = line[3:].strip().strip('"')
        if " -> " in path:  # rename
            path = path.split(" -> ", 1)[1]
        if path.startswith("app/frontend/"):
            areas.add("frontend")
        elif path.startswith("app/backend/"):
            areas.add("backend")
    return areas


def main() -> None:
    try:
        data: dict = json.load(sys.stdin)
    except Exception as e:  # noqa: BLE001
        print(f"[stop-hook] Không đọc được JSON của hook: {e}", file=sys.stderr)
        sys.exit(0)

    if data.get("stop_hook_active"):
        sys.exit(0)

    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR", ".")).resolve()
    areas = changed_areas(project_dir)
    if not areas:
        sys.exit(0)

    failures: list[str] = []

    if "frontend" in areas:
        fe = project_dir / "app" / "frontend"
        if not (fe / "node_modules").exists():
            print("[stop-hook] app/frontend chưa có node_modules, hãy chạy `npm install`. Bỏ qua kiểm tra FE.",
                  file=sys.stderr)
        else:
            ok, out = run(["npm", "run", "lint", "--silent"], fe)
            if not ok:
                failures.append(f"FE lint lỗi:\n{out}")
            ok, out = run(["npm", "run", "typecheck", "--silent"], fe)
            if not ok:
                failures.append(f"FE typecheck lỗi:\n{out}")

    if "backend" in areas:
        be = project_dir / "app" / "backend" / "EnglishCenter.Api"
        ok, out = run(["dotnet", "build", "-nologo", "-v", "q", "-clp:ErrorsOnly"], be)
        if not ok:
            if "MSB3027" in out or "being used by another process" in out:
                print("[stop-hook] dotnet build bị khóa vì API đang chạy, bỏ qua.", file=sys.stderr)
            else:
                failures.append(f"BE dotnet build lỗi:\n{out}")

    if failures:
        reason = ("Validation gate CHƯA XANH: " + " | ".join(f.replace("\n", " ") for f in failures)
                  + ". Sửa lỗi rồi chạy lại. Nếu lỗi có sẵn từ trước và nằm ngoài vùng của bạn, "
                    "hãy báo người dùng thay vì sửa file của vùng khác.")
        print(json.dumps({"decision": "block", "reason": reason}, ensure_ascii=False))
    sys.exit(0)


if __name__ == "__main__":
    main()
