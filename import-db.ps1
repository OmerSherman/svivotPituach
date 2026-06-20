# Import Omer's mydb_dump.sql into local MySQL + create forum message table
# Run: powershell -ExecutionPolicy Bypass -File import-db.ps1

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$dump  = Join-Path $PSScriptRoot "mydb_dump.sql"

if (-not (Test-Path $mysql)) {
    Write-Host "ERROR: mysql.exe not found at $mysql" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $dump)) {
    Write-Host "ERROR: mydb_dump.sql not found in project root" -ForegroundColor Red
    exit 1
}

Write-Host "MySQL import for svivotPituach" -ForegroundColor Cyan
Write-Host "Enter MySQL root password (press Enter if empty):" -ForegroundColor Yellow
$secure = Read-Host -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
)

$mysqlArgs = @("-u", "root", "--default-character-set=utf8mb4")
if ($password) {
    $mysqlArgs += @("-p$password")
}

Write-Host "Testing connection..." -ForegroundColor Cyan
& $mysql @mysqlArgs -e "SELECT 1 AS ok;" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not connect. Check password and that MYSQL80 is Running." -ForegroundColor Red
    exit 1
}
Write-Host "Connected OK" -ForegroundColor Green

Write-Host "Importing mydb_dump.sql (may take a minute)..." -ForegroundColor Cyan
$dumpContent = Get-Content $dump -Raw -Encoding UTF8
# Remove GTID line that often fails on fresh MySQL installs
$dumpContent = $dumpContent -replace "(?s)SET @@GLOBAL\.GTID_PURGED[^;]*;", ""
# Remove accidental trailing lines Omer added (wrong db name my_db)
$dumpContent = $dumpContent -replace "(?s)\r?\nUSE my_db[^\r\n]*\r?\n.*$", "`n"

$tempDump = Join-Path $env:TEMP "mydb_dump_import.sql"
Set-Content -Path $tempDump -Value $dumpContent -Encoding UTF8

Get-Content $tempDump -Raw | & $mysql @mysqlArgs 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Import failed. See message above." -ForegroundColor Red
    exit 1
}

Write-Host "Creating message table for forum..." -ForegroundColor Cyan
$messageSql = @"
USE mydb;
CREATE TABLE IF NOT EXISTS message (
    messageId INT AUTO_INCREMENT PRIMARY KEY,
    room VARCHAR(100) NOT NULL,
    userId INT NOT NULL,
    userName VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_room (room)
);
"@

& $mysql @mysqlArgs -e $messageSql 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: message table step failed" -ForegroundColor Yellow
} else {
    Write-Host "message table OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "Verifying..." -ForegroundColor Cyan
& $mysql @mysqlArgs -e "USE mydb; SHOW TABLES; SELECT COUNT(*) AS attractions FROM attraction; SELECT email, userRole FROM user LIMIT 3;"

Write-Host ""
Write-Host "Done! Next steps:" -ForegroundColor Green
Write-Host "  1. Copy Server\.env.example to Server\.env and set DB_PASSWORD + GROQ_API_KEY"
Write-Host "  2. cd Server && npm install && npm run db:generate && npm start"
Write-Host "  3. cd client && npm start"
Write-Host "  4. Login: michal@example.com / 123456"
