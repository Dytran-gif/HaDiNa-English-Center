#!/usr/bin/env python3
"""PostToolUse hook: kiểm tra nhanh sau mỗi lần sửa file (CHỈ CẢNH BÁO, không chặn).

Đọc JSON của Claude Code từ stdin. Sau khi Edit/Write/MultiEdit:
  - .ts/.tsx/.js/.jsx trong app/frontend/  -> oxlint <file>          (nhanh, vài trăm ms)
  - .cs trong app/backend/                  -> dotnet build (quiet)   (bắt lỗi compile sớm)

Typecheck toàn bộ FE (`npm run typecheck`) để dành cho Stop hook vì chậm hơn.
Luôn exit 0. Thiếu công cụ (npx/dotnet) thì bỏ qua.
Gắn vào: PostToolUse / Edit|Write|MultiEdit
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

FE_EXT = {".ts", ".tsx", ".js", ".jsx"}


def _emit(result: subprocess.CompletedProcess, ok: str, bad: str) -> None:
    out = (result.stdout or "") + (result.stderr or "")
    lines = [line for line in out.splitlines() if line.strip()]
    if result.returncode != 0 and lines:
        print("\n".join(lines[-25:]))
    print(f"[lint-hook] {ok}" if result.returncode == 0 else f"[lint-hook] {bad}")


def main() -> None:
    try:
        data: dict = json.load(sys.stdin)
    except Exception as e:  # noqa: BLE001
        print(f"[lint-hook] Không đọc được JSON của hook: {e}", file=sys.stderr)
        sys.exit(0)

    file_path_raw = (data.get("tool_input") or {}).get("file_path")
    if not file_path_raw:
        sys.exit(0)

    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR", ".")).resolve()
    file_path = Path(file_path_raw).resolve()
    try:
        rel = file_path.relative_to(project_dir).as_posix()
    except ValueError:
        sys.exit(0)

    frontend = project_dir / "app" / "frontend"
    backend_sln = project_dir / "app" / "backend" / "EnglishCenter.Api"

    if rel.startswith("app/frontend/src/") and file_path.suffix in FE_EXT:
        npx = shutil.which("npx")
        if not npx:
            print("[lint-hook] Không thấy npx trên PATH, bỏ qua lint FE")
            sys.exit(0)
        result = subprocess.run([npx, "oxlint", str(file_path)], cwd=str(frontend),
                                capture_output=True, text=True, encoding="utf-8", errors="replace")
        _emit(result, ok=f"oxlint OK: {rel}", bad=f"oxlint có lỗi ở {rel} (xem trên), sửa trước khi commit")

    elif rel.startswith("app/backend/") and file_path.suffix == ".cs":
        dotnet = shutil.which("dotnet")
        if not dotnet:
            print("[lint-hook] Không thấy dotnet trên PATH, bỏ qua build BE")
            sys.exit(0)
        result = subprocess.run([dotnet, "build", "-nologo", "-v", "q", "-clp:ErrorsOnly"],
                                cwd=str(backend_sln), capture_output=True, text=True,
                                encoding="utf-8", errors="replace")
        out = (result.stdout or "") + (result.stderr or "")
        if result.returncode != 0 and ("MSB3027" in out or "being used by another process" in out):
            print("[lint-hook] dotnet build bị khóa file vì API đang chạy (dotnet run). Dừng API rồi build lại.")
            sys.exit(0)
        _emit(result, ok="dotnet build OK", bad="dotnet build lỗi (xem trên), sửa trước khi commit")

    sys.exit(0)


if __name__ == "__main__":
    main()
