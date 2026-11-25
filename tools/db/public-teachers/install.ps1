param([string]$Server = "localhost", [string]$Database = "EnglishCenterDB")
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$api = Join-Path $repo "app\backend\EnglishCenter.Api\EnglishCenter.Api"
Push-Location $api
try {
    dotnet ef database update --connection "Server=$Server;Database=$Database;Integrated Security=True;TrustServerCertificate=True"
    if ($LASTEXITCODE -ne 0) { throw "Migration failed; profiles have not been imported." }
} finally { Pop-Location }
$destination = Join-Path $api "wwwroot\uploads\public-teachers"
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Copy-Item -Path (Join-Path $PSScriptRoot "images\*") -Destination $destination -Force
sqlcmd -S $Server -E -C -d $Database -I -b -f 65001 -i (Join-Path $PSScriptRoot "import-profiles.sql")
if ($LASTEXITCODE -ne 0) { throw "Profile import failed; SQL transaction rolled back." }
