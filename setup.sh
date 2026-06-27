#!/usr/bin/env bash
# =============================================================================
# Chulx — Project Setup Script (Bash)
# =============================================================================
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m'

echo ""
echo -e "${CYAN}========================================"
echo "   Chulx — Project Setup               "
echo -e "========================================${NC}"
echo ""

# ── Step 0: Prerequisites ────────────────────────────────────────────────────
for cmd in php composer node npm docker; do
    if ! command -v "$cmd" &>/dev/null; then
        echo -e "${RED}[ERROR] '$cmd' not found in PATH.${NC}"
        exit 1
    fi
done
echo -e "${GREEN}[OK] All prerequisites found.${NC}"

# ── Step 1: Env file ────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[1/9] Setting up environment file...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.chulx ]; then
        cp .env.chulx .env
        echo -e "${GRAY}  Copied .env.chulx -> .env${NC}"
    else
        cp .env.example .env
        echo -e "${GRAY}  Copied .env.example -> .env${NC}"
    fi
else
    echo -e "${GRAY}  .env already exists, skipping.${NC}"
fi

# ── Step 2: Composer install ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/9] Installing Composer dependencies...${NC}"
composer install --no-interaction --prefer-dist

# ── Step 3: Composer packages ───────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/9] Installing required Composer packages...${NC}"
composer require \
    filament/filament:"^3.3" \
    laravel/reverb:@beta \
    laravel/sanctum \
    spatie/laravel-permission \
    spatie/laravel-activitylog \
    brick/money \
    mstaack/laravel-postgis \
    intervention/image \
    maatwebsite/excel \
    propaganistas/laravel-phone \
    -W --no-interaction

composer require --dev \
    barryvdh/laravel-ide-helper \
    barryvdh/laravel-debugbar \
    --no-interaction

# ── Step 4: NPM install ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/9] Installing NPM dependencies...${NC}"
npm install \
    react@^19 react-dom@^19 \
    @tanstack/react-query@^5 zustand@^5 \
    react-hook-form@^7 @hookform/resolvers@^5 zod@^3 \
    react-qr-code@^2 html5-qrcode@^2 \
    i18next@^24 react-i18next@^15 \
    @react-google-maps/api@^2 \
    axios@^1 lucide-react@^0.500 framer-motion@^12 \
    laravel-echo@^2 pusher-js@^8 \
    clsx@^2 tailwind-merge@^3

npm install -D \
    @types/react@^19 @types/react-dom@^19 \
    @vitejs/plugin-react@^4 \
    typescript@^5.8 @types/node@^22

# ── Step 5: Docker directories ──────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/9] Creating Docker support directories...${NC}"
mkdir -p docker/{app,nginx,pgsql}

# ── Step 6: App key ────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[6/9] Generating application key...${NC}"
php artisan key:generate --ansi

# ── Step 7: Vite config swap ───────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[7/9] Checking Vite configuration...${NC}"
if [ -f vite.config.js ] && [ -f vite.config.ts ]; then
    rm vite.config.js
    echo -e "${GRAY}  Removed old vite.config.js${NC}"
fi

# ── Step 8: Docker up ──────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[8/9] Starting Docker services...${NC}"
docker compose up -d

echo -e "${GRAY}  Waiting for PostgreSQL...${NC}"
SECONDS=0
until docker inspect --format='{{.State.Health.Status}}' chulx-pgsql 2>/dev/null | grep -q healthy; do
    if [ $SECONDS -ge 30 ]; then
        echo -e "${YELLOW}  [WARN] PostgreSQL may not be ready. Check logs.${NC}"
        break
    fi
    sleep 2
done
echo -e "${GREEN}  PostgreSQL is healthy.${NC}"

# ── Step 9: Publish & migrate ──────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[9/9] Publishing assets & running migrations...${NC}"
php artisan filament:install --panels --no-interaction 2>/dev/null || true
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --no-interaction 2>/dev/null || true
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --no-interaction 2>/dev/null || true
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations" --no-interaction 2>/dev/null || true
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-config" --no-interaction 2>/dev/null || true

php artisan migrate --force --no-interaction

echo ""
echo -e "${GREEN}========================================"
echo "   Chulx setup complete!               "
echo -e "========================================${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Review .env and update secrets"
echo "  2. Create config files from system_config.md"
echo "  3. Run: npm run dev"
echo "  4. Run: php artisan serve"
echo "  5. Visit: http://localhost"
echo ""
