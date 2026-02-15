#!/bin/bash

# deploy.sh - Automated Update Script for Hotel Booking System

set -e # Exit on error

echo "🚀 Starting Deployment..."

# Function to update Backend
update_backend() {
    echo "--------------------------------------"
    echo "📦 Updating Backend API..."
    echo "--------------------------------------"
    cd hotel-booking-nest-postgres
    
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
    
    cd ..
    echo "✅ Backend Updated Successfully!"
}

# Function to update Frontend
update_frontend() {
    echo "--------------------------------------"
    echo "🎨 Updating Frontend Web..."
    echo "--------------------------------------"
    cd hotel-booking-frontend
    
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
    
    cd ..
    echo "✅ Frontend Updated Successfully!"
}

# Main Execution
if [ -d "hotel-booking-nest-postgres" ]; then
    update_backend
else
    echo "⚠️  Backend folder not found. Skipping."
fi

if [ -d "hotel-booking-frontend" ]; then
    update_frontend
else
    echo "⚠️  Frontend folder not found. Skipping."
fi

echo "--------------------------------------"
echo "🎉 Deployment Complete!"
echo "--------------------------------------"
