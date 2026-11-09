<#
  restore-db.ps1 - Khoi phuc EnglishCenterDb tu file backup (.bak) vao SQL Server tren may minh

  Dung khi may minh CHUA co database EnglishCenterDb (loi "Cannot open database EnglishCenterDb").
  File backup mac dinh: tools\db\EnglishCenterDb.bak (12 bang cua InitialCreate + du lieu demo:
  admin / teacher / teacher2 / student / student2 @demo.com, mat khau 123456).

  Script lam:
    1. Doc ten server tu appsettings.json (+ appsettings.Development.json neu co), ket noi vao master
    2. Doc header file backup, so phien ban SQL Server (backup moi hon server thi KHONG restore duoc)
    3. Neu DB da ton tai: hoi truoc khi ghi de (mac dinh KHONG ghi de)
    4. RESTORE DATABASE ... WITH MOVE vao thu muc data mac dinh cua SQL Server
    5. Kiem tra bang Users, in so luong tai khoan

  Chay (PowerShell, tu goc repo):
    powershell -ExecutionPolicy Bypass -File tools\db\restore-db.ps1
    powershell -ExecutionPolicy Bypass -File tools\db\restore-db.ps1 -BackupFile D:\EnglishCenterDb.bak
    powershell -ExecutionPolicy Bypass -File tools\db\restore-db.ps1 -Force    # ghi de DB dang co (MAT du lieu cu)

  Sau khi restore: chay tools\db\teacher-features.ps1 de them 22 bang Teacher.
#>
param(
    [string]$BackupFile = "",
    [string]$Database   = "EnglishCenterDb",
    [switch]$Force,       # cho phep ghi de DB da ton tai
    [switch]$Yes          # bo qua cau hoi xac nhan
)

$ErrorActionPreference = "Stop"

function Step($t) { Write-Host ""; Write-Host "==> $t" -ForegroundColor Cyan }
function Ok($t)   { Write-Host "    [OK] $t" -ForegroundColor Green }
function Warn($t) { Write-Host "    [!]  $t" -ForegroundColor Yellow }
function Fail($t) { Write-Host "    [X]  $t" -ForegroundColor Red; exit 1 }
function Confirm($q) {
    if ($Yes) { return $true }
    $a = Read-Host "    $q (y/N)"
    return ($a -eq "y" -or $a -eq "Y")
}

# ---------- 0. Duong dan ----------
$RepoRoot   = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ProjectDir = Join-Path $RepoRoot "app\backend\EnglishCenter.Api\EnglishCenter.Api"
if (-not $BackupFile) { $BackupFile = Join-Path $PSScriptRoot "EnglishCenterDb.bak" }
if (-not (Test-Path $BackupFile)) { Fail "Khong thay file backup: $BackupFile" }
$BackupFile = (Resolve-Path $BackupFile).Path
Write-Host "Backup: $BackupFile"

# ---------- 1. Ket noi master ----------
Step "Doc chuoi ket noi"
$appsettings = Join-Path $ProjectDir "appsettings.json"
$conn = (Get-Content $appsettings -Raw | ConvertFrom-Json).ConnectionStrings.Default
$devFile = Join-Path $ProjectDir "appsettings.Development.json"
if (Test-Path $devFile) {
    $dev = Get-Content $devFile -Raw | ConvertFrom-Json
    if ($dev.ConnectionStrings -and $dev.ConnectionStrings.Default) { $conn = $dev.ConnectionStrings.Default }
}
if (-not $conn) { Fail "Khong thay ConnectionStrings:Default trong appsettings.json" }

# Doc / doi chuoi ket noi bang regex (SqlConnectionStringBuilder bi PowerShell coi la dictionary nen khong dung duoc)
function Get-ConnPart([string]$cs, [string[]]$names) {
    foreach ($n in $names) {
        $m = [regex]::Match($cs, "(?i)(?:^|;)\s*$n\s*=\s*([^;]*)")
        if ($m.Success) { return $m.Groups[1].Value.Trim() }
    }
    return ""
}
function Set-ConnDatabase([string]$cs, [string]$db) {
    $re = '(?i)(^|;)\s*(Database|Initial Catalog)\s*=\s*[^;]*'
    if ([regex]::IsMatch($cs, $re)) { return [regex]::Replace($cs, $re, '${1}Database=' + $db) }
    return $cs.TrimEnd(';') + ";Database=$db"
}
$server = Get-ConnPart $conn @("Server", "Data Source", "Address", "Addr")
$appDb  = Get-ConnPart $conn @("Database", "Initial Catalog")
if ($appDb -and $appDb -ne $Database) {
    Warn "appsettings dung database '$appDb', khac voi -Database '$Database'. Se restore thanh '$appDb'."
    $Database = $appDb
}
$master = Set-ConnDatabase $conn "master"
Ok "Server: $server | Database dich: $Database"

function Sql-Query($sql) {
    $c = New-Object System.Data.SqlClient.SqlConnection $master
    $c.Open()
    try {
        $cmd = $c.CreateCommand(); $cmd.CommandText = $sql; $cmd.CommandTimeout = 600
        $t = New-Object System.Data.DataTable
        $t.Load($cmd.ExecuteReader())
        return ,$t
    } finally { $c.Close() }
}
function Sql-Exec($sql) {
    $c = New-Object System.Data.SqlClient.SqlConnection $master
    $c.Open()
    try { $cmd = $c.CreateCommand(); $cmd.CommandText = $sql; $cmd.CommandTimeout = 600; [void]$cmd.ExecuteNonQuery() } finally { $c.Close() }
}
function Q($s) { return $s.Replace("'", "''") }

try { $info = Sql-Query "SELECT CAST(SERVERPROPERTY('ProductMajorVersion') AS int) AS Major, CAST(SERVERPROPERTY('ProductVersion') AS nvarchar(50)) AS Ver, CAST(SERVERPROPERTY('InstanceDefaultDataPath') AS nvarchar(400)) AS DataPath, CAST(SERVERPROPERTY('InstanceDefaultLogPath') AS nvarchar(400)) AS LogPath" }
catch { Fail "Khong ket noi duoc SQL Server ($server): $($_.Exception.Message)" }
$serverMajor = [int]$info.Rows[0].Major
$dataPath = [string]$info.Rows[0].DataPath
$logPath  = [string]$info.Rows[0].LogPath
Ok "SQL Server $($info.Rows[0].Ver)"

# ---------- 2. Doc header backup ----------
Step "Doc file backup"
# SQL Server (tai khoan NT Service\MSSQLSERVER) phai doc duoc file. Neu bi tu choi thi chep sang C:\Users\Public.
function Read-Header($path) { return Sql-Query "RESTORE HEADERONLY FROM DISK = N'$(Q $path)'" }
$sqlBak = $BackupFile
try { $header = Read-Header $sqlBak }
catch {
    $msg = $_.Exception.Message
    if ($msg -match "Operating system error 5|Access is denied|error 5\(") {
        $public = Join-Path $env:PUBLIC "EnglishCenterDb.bak"
        Warn "SQL Server khong doc duoc file o vi tri hien tai. Chep sang $public"
        Copy-Item $BackupFile $public -Force
        $sqlBak = $public
        try { $header = Read-Header $sqlBak } catch { Fail "Van khong doc duoc backup: $($_.Exception.Message)`n    Hay chep file vao thu muc Backup cua SQL Server roi chay lai voi -BackupFile <duong dan>" }
    } elseif ($msg -match "version|phien ban|cannot be restored") {
        Fail "Backup duoc tao tu SQL Server moi hon server cua ban.`n    $msg`n    Cach khac: tao DB moi bang EF -> powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -CreateFresh -SeedDemo"
    } else { Fail "Khong doc duoc backup: $msg" }
}
$h = $header.Rows[0]
$bakMajor = [int]$h.SoftwareVersionMajor
Ok ("Backup cua DB '{0}', tao luc {1}, SQL Server ban {2}.{3}" -f $h.DatabaseName, $h.BackupFinishDate, $h.SoftwareVersionMajor, $h.SoftwareVersionMinor)
if ($bakMajor -gt $serverMajor) {
    Fail ("Backup tao tu SQL Server ban {0} (vd SQL Server 2025 = 17) nhung may ban la ban {1}. SQL Server khong restore nguoc phien ban.`n    Cach 1: cai SQL Server 2025 Developer/Express.`n    Cach 2: tao DB moi bang EF -> powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -CreateFresh -SeedDemo" -f $bakMajor, $serverMajor)
}

$files = Sql-Query "RESTORE FILELISTONLY FROM DISK = N'$(Q $sqlBak)'"

# ---------- 3. DB da ton tai? ----------
Step "Kiem tra database $Database"
$exists = (Sql-Query "SELECT COUNT(*) AS N FROM sys.databases WHERE name = N'$(Q $Database)'").Rows[0].N -gt 0
if ($exists) {
    Warn "Database '$Database' DA TON TAI tren server."
    if (-not $Force) { Fail "Khong ghi de. Neu chac chan muon thay bang ban backup (mat du lieu hien tai), chay lai voi -Force." }
    if (-not (Confirm "GHI DE '$Database' bang ban backup? Du lieu hien tai se mat")) { Fail "Dung theo yeu cau." }
}

# ---------- 4. Restore ----------
Step "Restore"
$moves = @()
foreach ($f in $files.Rows) {
    if ($f.Type -eq "L") { $target = Join-Path $logPath  "$($Database)_log.ldf" }
    else                 { $target = Join-Path $dataPath "$($Database).mdf" }
    $moves += "MOVE N'$(Q ([string]$f.LogicalName))' TO N'$(Q $target)'"
    Write-Host "    $($f.LogicalName) -> $target"
}
$sql = "RESTORE DATABASE [$Database] FROM DISK = N'$(Q $sqlBak)' WITH " + ($moves -join ", ") + ", RECOVERY, STATS = 25"
if ($exists) {
    Sql-Exec "ALTER DATABASE [$Database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE"
    $sql += ", REPLACE"
}
try { Sql-Exec $sql }
catch {
    if ($exists) { try { Sql-Exec "ALTER DATABASE [$Database] SET MULTI_USER" } catch {} }
    Fail "Restore that bai: $($_.Exception.Message)"
}
try { Sql-Exec "ALTER DATABASE [$Database] SET MULTI_USER" } catch {}
# Chu so huu cu la tai khoan Windows tren may khac -> doi ve sa cho khoi loi quyen
try { Sql-Exec "ALTER AUTHORIZATION ON DATABASE::[$Database] TO [sa]" } catch { Warn "Khong doi duoc owner sang sa (bo qua): $($_.Exception.Message)" }
Ok "Da restore $Database"

# ---------- 5. Kiem tra ----------
Step "Kiem tra"
$check = Sql-Query "SELECT (SELECT COUNT(*) FROM [$Database].dbo.Users) AS Users, (SELECT COUNT(*) FROM [$Database].sys.tables) AS Tables, CASE WHEN OBJECT_ID(N'[$Database].dbo.ClassSessions', N'U') IS NULL THEN 0 ELSE 1 END AS HasTeacher"
$r = $check.Rows[0]
Ok "So bang: $($r.Tables) | So tai khoan: $($r.Users)"
if ($r.HasTeacher -eq 0) {
    Warn "Chua co bang Teacher (ClassSessions...). Buoc tiep theo:"
    Write-Host "    powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -SeedDemo" -ForegroundColor White
} else {
    Ok "Da co bang Teacher. Chay API: cd app\backend\EnglishCenter.Api\EnglishCenter.Api ; dotnet ef database update ; dotnet run --launch-profile http"
}
