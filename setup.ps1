# =============================================================================
# Chulx — Project Setup Script (Windows PowerShell)
# =============================================================================
# Usage: .\setup.ps1
#
# This script:
#   1. Copies environment config
#   2. Installs Composer & NPM dependencies
#   3. Starts Docker services
#   4. Runs database migrations & seeders
#   5. Generates application key
#   6. Publishes vendor assets
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Chulx — Project Setup               " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 0: Check prerequisites ──────────────────────────────────────────────
$prerequisites = @("php", "composer", "node", "npm", "docker")
foreach ($cmd in $prerequisites) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] '$cmd' is not installed or not in PATH." -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] All prerequisites found." -ForegroundColor Green

# ── Step 1: Environment file ─────────────────────────────────────────────────
Write-Host ""
Write-Host "[1/9] Setting up environment file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.chulx") {
        Copy-Item ".env.chulx" ".env"
        Write-Host "  Copied .env.chulx -> .env" -ForegroundColor Gray
    } else {
        Copy-Item ".env.example" ".env"
        Write-Host "  Copied .env.example -> .env (update manually!)" -ForegroundColor Gray
    }
} else {
    Write-Host "  .env already exists, skipping." -ForegroundColor Gray
}

# ── Step 2: Composer install ─────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/9] Installing Composer dependencies..." -ForegroundColor Yellow
composer install --no-interaction --prefer-dist

# ── Step 3: Composer packages (production) ───────────────────────────────────
Write-Host ""
Write-Host "[3/9] Installing required Composer packages..." -ForegroundColor Yellow

$composerPackages = @(
    "filament/filament:^3.3",
    "laravel/reverb:@beta",
    "laravel/sanctum",
    "spatie/laravel-permission",
    "spatie/laravel-activitylog",
    "brick/money",
    "mstaack/laravel-postgis",
    "intervention/image",
    "maatwebsite/excel",
    "propaganistas/laravel-phone"
)

$composerDevPackages = @(
    "barryvdh/laravel-ide-helper",
    "barryvdh/laravel-debugbar"
)

composer require $composerPackages -W --no-interaction
composer require --dev $composerDevPackages --no-interaction

# ── Step 4: NPM install ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/9] Installing NPM dependencies..." -ForegroundColor Yellow

$npmPackages = @(
    "react@^19",
    "react-dom@^19",
    "@tanstack/react-query@^5",
    "zustand@^5",
    "react-hook-form@^7",
    "@hookform/resolvers@^5",
    "zod@^3",
    "react-qr-code@^2",
    "html5-qrcode@^2",
    "i18next@^24",
    "react-i18next@^15",
    "@react-google-maps/api@^2",
    "axios@^1",
    "lucide-react@^0.500",
    "framer-motion@^12",
    "laravel-echo@^2",
    "pusher-js@^8",
    "clsx@^2",
    "tailwind-merge@^3"
)

$npmDevPackages = @(
    "@types/react@^19",
    "@types/react-dom@^19",
    "@vitejs/plugin-react@^4",
    "typescript@^5.8",
    "@types/node@^22"
)

npm install $npmPackages
npm install -D $npmDevPackages

# ── Step 5: Create Docker support files ──────────────────────────────────────
Write-Host ""
Write-Host "[5/9] Creating Docker support directories..." -ForegroundColor Yellow

$dockerDirs = @(
    "docker/app",
    "docker/nginx",
    "docker/pgsql"
)

foreach ($dir in $dockerDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created $dir" -ForegroundColor Gray
    }
}

# ── Step 6: Generate application key ────────────────────────────────────────
Write-Host ""
Write-Host "[6/9] Generating application key..." -ForegroundColor Yellow
php artisan key:generate --ansi

# ── Step 7: Rename Vite config ──────────────────────────────────────────────
Write-Host ""
Write-Host "[7/9] Checking Vite configuration..." -ForegroundColor Yellow
if ((Test-Path "vite.config.js") -and (Test-Path "vite.config.ts")) {
    Remove-Item "vite.config.js" -Force
    Write-Host "  Removed old vite.config.js (using vite.config.ts)" -ForegroundColor Gray
} elseif (Test-Path "vite.config.js") {
    Write-Host "  [WARN] vite.config.ts not found yet. Create it from the docs." -ForegroundColor DarkYellow
}

# ── Step 8: Start Docker services ───────────────────────────────────────────
Write-Host ""
Write-Host "[8/9] Starting Docker services..." -ForegroundColor Yellow
docker compose up -d

Write-Host "  Waiting for PostgreSQL to be healthy..." -ForegroundColor Gray
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    $health = docker inspect --format='{{.State.Health.Status}}' chulx-pgsql 2>$null
    if ($health -eq "healthy") { break }
    Start-Sleep -Seconds 2
    $waited += 2
}

if ($waited -ge $maxWait) {
    Write-Host "  [WARN] PostgreSQL may not be ready yet. Check: docker compose logs pgsql" -ForegroundColor DarkYellow
} else {
    Write-Host "  PostgreSQL is healthy." -ForegroundColor Green
}

# ── Step 9: Publish vendor assets & migrate ──────────────────────────────────
Write-Host ""
Write-Host "[9/9] Publishing assets & running migrations..." -ForegroundColor Yellow

php artisan filament:install --panels --no-interaction 2>$null
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --no-interaction 2>$null
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --no-interaction 2>$null
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations" --no-interaction 2>$null
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-config" --no-interaction 2>$null

php artisan migrate --force --no-interaction

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Chulx setup complete!               " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review .env and update secrets"
Write-Host "  2. Create Docker files from system_config.md"
Write-Host "  3. Create vite.config.ts from system_config.md"
Write-Host "  4. Create tsconfig.json from system_config.md"
Write-Host "  5. Create config/chulx.php from system_config.md"
Write-Host "  6. Run: npm run dev"
Write-Host "  7. Run: php artisan serve"
Write-Host "  8. Visit: http://localhost"
Write-Host ""
