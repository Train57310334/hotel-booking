#!/bin/bash

# deploy.sh - Automated Update Script for Hotel Booking System

set -e # Exit on error

# --- CONFIGURATION ---
# Live Server Paths (Absolute Paths)
BACKEND_DIR="/home/bookingkub/domains/api.bookingkub.com/public_html"
FRONTEND_DIR="/home/bookingkub/domains/app.bookingkub.com/public_html"

echo "🚀 Starting Deployment..."

# Function to update Backend
update_backend() {
    echo "--------------------------------------"
    echo "📦 Updating Backend API..."
    echo "--------------------------------------"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        echo "⚠️  Backend directory '$BACKEND_DIR' not found. Creating it or check path."
        # Optional: mkdir -p "$BACKEND_DIR" if this is a fresh install script, but for update assume it exists
        return
    fi

    cd "$BACKEND_DIR" || exit
    
    echo "⬇️  Pulling latest code..."
    git pull origin main
    
    echo "📦 Installing dependencies..."
    npm ci --silent
    
    echo "🗄️  Running Database Migrations..."
    npx prisma migrate deploy
    npx prisma generate
    
    echo "🏗️  Building API..."
    npm run build
    
    echo "🔄 Restarting API Service..."
    pm2 restart hotel-api || pm2 start dist/main.js --name "hotel-api"
    
    # Return to previous directory (though typically we run from root)
    cd - > /dev/null
    echo "✅ Backend Updated Successfully!"
}

# Function to update Frontend
update_frontend() {
    echo "--------------------------------------"
    echo "🎨 Updating Frontend Web..."
    echo "--------------------------------------"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo "⚠️  Frontend directory '$FRONTEND_DIR' not found."
        return
    fi

    cd "$FRONTEND_DIR" || exit
    
    echo "⬇️  Pulling latest code..."
    git pull origin main
    
    echo "📦 Installing dependencies..."
    npm ci --silent
    
    echo "🏗️  Building Next.js..."
    if [ -f ".env.production" ]; then
        echo "📄 Loading .env.production..."
        export $(grep -v '^#' .env.production | xargs)
    fi
    echo "🔗 API URL: ${NEXT_PUBLIC_API_BASE:-'Not Set (Will default to localhost)'}"
    
    npm run build
    
    echo "🔄 Restarting Frontend Service..."
    pm2 restart hotel-web || pm2 start npm --name "hotel-web" -- start
    
    cd - > /dev/null
    echo "✅ Frontend Updated Successfully!"
}

# Main Execution

# Check if directories exist relative to current location
# Only run update if directory is found

if [ -d "$BACKEND_DIR" ]; then
    update_backend
else
    echo "⚠️  Backend folder '$BACKEND_DIR' not found. Skipping."
fi

if [ -d "$FRONTEND_DIR" ]; then
    update_frontend
else
    echo "⚠️  Frontend folder '$FRONTEND_DIR' not found. Skipping."
fi

echo "--------------------------------------"
echo "🎉 Deployment Complete!"
echo "--------------------------------------"
