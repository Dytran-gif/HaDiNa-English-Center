<#
  teacher-demo-data.ps1 - Tao du lieu demo cho cong Giao vien (teacher@demo.com)

  Lam 2 viec:
    1. Chep file demo (anh bieu do, PDF, file ghi am) vao wwwroot/uploads/demo cua backend
    2. Chay teacher-demo-data.sql bang sqlcmd (1 transaction, loi thi rollback het)

  Chay tu goc repo:
    powershell -ExecutionPolicy Bypass -File tools\db\demo\teacher-demo-data.ps1

  Yeu cau: DB da co migration StudentFeedbackAndSubmissionFile (dotnet ef database update).
  Chay lai lan 2 se tu bo qua (da co hoc vien HV2001).
#>
param(
    [string]$Server = "localhost",
    [string]$Database = "EnglishCenterDb"
)

$ErrorActionPreference = "Stop"

function Fail($msg) { Write-Host ""; Write-Host "LOI: $msg" -ForegroundColor Red; exit 1 }

$here = $PSScriptRoot
$repo = (Resolve-Path (Join-Path $here "..\..\..")).Path
$api  = Join-Path $repo "app\backend\EnglishCenter.Api\EnglishCenter.Api"
$sql  = Join-Path $here "teacher-demo-data.sql"
$src  = Join-Path $here "files"

if (-not (Test-Path $api)) { Fail "Khong tim thay thu muc backend: $api" }
if (-not (Test-Path $sql)) { Fail "Khong tim thay file $sql" }
if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) { Fail "Chua co sqlcmd. Cai 'sqlcmd' (go-sqlcmd) hoac SQL Server Command Line Utilities." }

Write-Host "==> 1. Chep file demo vao wwwroot\uploads\demo" -ForegroundColor Cyan
$dest = Join-Path $api "wwwroot\uploads\demo"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Path (Join-Path $src "*") -Destination $dest -Force
$n = (Get-ChildItem $dest -File).Count
Write-Host "    $n file -> $dest"

Write-Host "==> 2. Tao du lieu trong $Server / $Database" -ForegroundColor Cyan
# -I: bat QUOTED_IDENTIFIER (can cho index co dieu kien), -b: dung khi loi, -f 65001: doc file UTF-8 (tieng Viet)
& sqlcmd -S $Server -E -d $Database -I -b -f 65001 -i $sql
if ($LASTEXITCODE -ne 0) { Fail "sqlcmd bao loi (xem dong Msg ... o tren). Du lieu da rollback, chua co gi thay doi." }

Write-Host ""
Write-Host "XONG. Dang nhap qua may chu: teacher@demo.com / 123456" -ForegroundColor Green
Write-Host "Hoc vien demo: HV2001 - HV2016, vi du minhanh.le@demo.com (mat khau giong teacher@demo.com)."
Write-Host "Neu backend dang chay thi khong can khoi dong lai; chi can tai lai trang."
