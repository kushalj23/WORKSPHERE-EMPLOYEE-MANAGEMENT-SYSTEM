# setup-tools.ps1
# Script to configure environmental variables for WorkSphere Platform build tools

Write-Host "Configuring build tools for WorkSphere Platform..." -ForegroundColor Cyan

# 1. Java 21 Check
$JavaPath = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
if (Test-Path $JavaPath) {
    Write-Host "[OK] Found Java 21 at $JavaPath" -ForegroundColor Green
    $env:JAVA_HOME = $JavaPath
} else {
    Write-Host "[WARNING] Java 21 not found at $JavaPath. Attempting to install via winget..." -ForegroundColor Yellow
    winget install Microsoft.OpenJDK.21 --silent --accept-package-agreements --accept-source-agreements
    if (Test-Path $JavaPath) {
        Write-Host "[OK] Installed Java 21 successfully." -ForegroundColor Green
        $env:JAVA_HOME = $JavaPath
    } else {
        Write-Host "[ERROR] Could not install Java 21. Please install manually." -ForegroundColor Red
    }
}

# 2. Node.js Check
$NodePath = "C:\Program Files\nodejs"
if (Test-Path $NodePath) {
    Write-Host "[OK] Found Node.js at $NodePath" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Node.js not found. Attempting to install via winget..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    if (Test-Path $NodePath) {
        Write-Host "[OK] Installed Node.js successfully." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Could not install Node.js. Please install manually." -ForegroundColor Red
    }
}

# 3. Maven Check
$MavenPath = "D:\PROJECT 01\.tools\apache-maven-3.9.6"
if (Test-Path $MavenPath) {
    Write-Host "[OK] Found Maven at $MavenPath" -ForegroundColor Green
} else {
    Write-Host "[INFO] Maven not found. Downloading Apache Maven..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "D:\PROJECT 01\.tools" | Out-Null
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile "D:\PROJECT 01\maven.zip"
    Expand-Archive -Path "D:\PROJECT 01\maven.zip" -DestinationPath "D:\PROJECT 01\.tools"
    Remove-Item "D:\PROJECT 01\maven.zip"
    Write-Host "[OK] Maven extracted to $MavenPath" -ForegroundColor Green
}

# Apply env variables for the current session
$env:JAVA_HOME = $JavaPath
$env:M2_HOME = $MavenPath
$env:PATH = "$JavaPath\bin;$MavenPath\bin;$NodePath;" + $env:PATH

# Database configuration for local run
$env:DB_URL = "jdbc:postgresql://aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require"
$env:DB_USERNAME = "postgres.psotqdkpduaerahxbfbh"
$env:DB_PASSWORD = "Jkl@1234_2026" # <-- If you reset this in the Supabase Dashboard, update it here!
$env:JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

Write-Host "`nAll tools and database configurations applied for the current session!" -ForegroundColor Green
Write-Host "If you reset your database password, update the DB_PASSWORD in setup-tools.ps1 before running." -ForegroundColor Yellow
Write-Host "`nTo verify tools, run:" -ForegroundColor Cyan
Write-Host "  java -version; mvn -v; node -v; npm -v" -ForegroundColor Gray

