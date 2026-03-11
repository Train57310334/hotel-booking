#!/bin/bash

# deploy-frontend.sh - Setup & Update Script for Frontend (Next.js)
# Run this script from the root of your project: bash deploy-frontend.sh

set -e # Exit on error

echo "🚀 Starting Next.js Frontend Deployment..."

# Directories
ROOT_DIR=$(pwd)
FRONTEND_DIR="$ROOT_DIR/hotel-booking-frontend"

echo "📂 Root Directory: $ROOT_DIR"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Frontend folder not found at $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

echo "⬇️  Pulling latest frontend code..."
git pull || echo "⚠️  Git pull failed or not a git repository. Continuing anyway..."

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️  Building Next.js Web App..."
npm run build

echo "🔄 Restarting Frontend Service (using PM2)..."
if ! command -v pm2 &> /dev/null
then
    echo "⚠️  pm2 could not be found."
    echo "⚠️  Skipping pm2 restart. You can start it manually with 'npm run start'."
else
    pm2 restart hotel-web || pm2 start npm --name "hotel-web" -- start
    pm2 save
fi

echo "✅ Frontend Updated Successfully!"
cd "$ROOT_DIR"
