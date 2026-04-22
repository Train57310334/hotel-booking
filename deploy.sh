#!/bin/bash

# deploy.sh - Automated Update Script for Hotel Booking System

set -e # Exit on error

RESET="\033[0m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
BOLD="\033[1m"

print_step() { echo -e "\n${BLUE}${BOLD}━━━ $1 ━━━${RESET}"; }
print_ok()   { echo -e "${GREEN}  ✓ $1${RESET}"; }
print_warn() { echo -e "${YELLOW}  ⚠ $1${RESET}"; }
print_err()  { echo -e "${RED}  ✗ $1${RESET}"; exit 1; }

# Live Server Paths (Absolute Paths for CPanel/DirectAdmin VPS structure)
BACKEND_DIR="/home/bookingkub/domains/api.bookingkub.com/public_html"
FRONTEND_DIR="/home/bookingkub/domains/app.bookingkub.com/public_html"

echo -e "\n${BOLD}╔══════════════════════════════════════════╗"
echo -e "║     BookingKub Live Server Deployer      ║"
echo -e "╚══════════════════════════════════════════╝${RESET}\n"

# Function to update Backend
update_backend() {
    print_step "Updating Backend API"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_warn "Backend directory '$BACKEND_DIR' not found. Skipping."
        return
    fi

    cd "$BACKEND_DIR" || exit
    
    echo "  → git pull origin main..."
    git pull origin main 2>&1 | tail -3 || print_warn "git pull encountered issues, proceeding anyway."
    
    echo "  → npm ci..."
    npm ci --silent
    print_ok "Backend dependencies installed"
    
    echo "  → Running database migrations..."
    npx prisma migrate deploy || {
       print_warn "migrate deploy failed — falling back to db push"
       npx prisma db push --accept-data-loss
    }
    npx prisma generate
    print_ok "Database schema ready"
    
    echo "  → Building API..."
    npm run build
    print_ok "API built successfully"
    
    if command -v pm2 &> /dev/null; then
       pm2 describe hotel-api &> /dev/null && pm2 reload hotel-api || pm2 start dist/main.js --name "hotel-api"
       pm2 save --force
       print_ok "API restarted via PM2"
    else
       print_warn "PM2 not found. You must restart the server manually."
    fi
    
    cd - > /dev/null
}

# Function to update Frontend
update_frontend() {
    print_step "Updating Frontend Web"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_warn "Frontend directory '$FRONTEND_DIR' not found. Skipping."
        return
    fi

    cd "$FRONTEND_DIR" || exit
    
    echo "  → git pull origin main..."
    git pull origin main 2>&1 | tail -3 || print_warn "git pull encountered issues, proceeding anyway."
    
    echo "  → npm ci..."
    npm ci --silent
    print_ok "Frontend dependencies installed"
    
    if [ -f ".env.production" ]; then
        export $(grep -v '^#' .env.production | xargs)
        print_ok "Loaded .env.production"
    fi
    
    echo "  → Building Next.js front-end..."
    npm run build
    print_ok "Next.js built successfully"
    
    if command -v pm2 &> /dev/null; then
       pm2 describe hotel-web &> /dev/null && pm2 reload hotel-web || pm2 start npm --name "hotel-web" -- start
       pm2 save --force
       print_ok "Frontend restarted via PM2"
    else
       print_warn "PM2 not found. You must restart the server manually."
    fi
    
    cd - > /dev/null
}

# Main Execution

# Check if directories exist relative to current location
if [ -d "$BACKEND_DIR" ]; then
    update_backend
else
    print_warn "Backend parent path '$BACKEND_DIR' inaccessible. Skipped."
fi

if [ -d "$FRONTEND_DIR" ]; then
    update_frontend
else
    print_warn "Frontend parent path '$FRONTEND_DIR' inaccessible. Skipped."
fi

echo -e "\n${GREEN}${BOLD}╔══════════════════════════════════════════╗"
echo -e "║        🎉 Deployment Processes Finished  ║"
echo -e "╚══════════════════════════════════════════╝${RESET}\n"
