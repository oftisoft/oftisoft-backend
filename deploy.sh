#!/bin/bash

# Deployment script for VPS
# This script can be run manually on the VPS or called from CI/CD

set -e

APP_DIR="/var/www/oftisoft-backend"
APP_NAME="oftisoft-backend"

echo "🚀 Starting deployment..."

# Navigate to application directory
cd $APP_DIR

# Pull latest changes (if using git on server)
# git pull origin master

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build application (if not built on CI/CD)
# npm run build

# Restart application with PM2
echo "🔄 Restarting application..."
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart $APP_NAME
else
    pm2 start dist/main.js --name $APP_NAME
fi

# Save PM2 process list
pm2 save

echo "✅ Deployment completed successfully!"
pm2 status
