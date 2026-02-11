#!/bin/bash

# Docker deployment script for VPS
# This script can be run manually on the VPS

set -e

APP_DIR="/var/www/oftisoft-backend"
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting Docker deployment..."

# Navigate to application directory
cd $APP_DIR

# Login to Docker Hub (if needed)
# echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull backend

# Stop and remove only backend container (keep nginx and certbot running)
echo "🛑 Stopping backend container..."
docker-compose -f $COMPOSE_FILE stop backend || true
docker-compose -f $COMPOSE_FILE rm -f backend || true

# Start backend container
echo "▶️  Starting backend container..."
docker-compose -f $COMPOSE_FILE up -d backend

# Reload nginx to pick up any changes
echo "🔄 Reloading nginx..."
docker-compose -f $COMPOSE_FILE exec -T nginx nginx -s reload || docker-compose -f $COMPOSE_FILE restart nginx || true

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -af --filter "until=168h"

# Show running containers
echo "📊 Container status:"
docker-compose -f $COMPOSE_FILE ps

echo "✅ Deployment completed successfully!"
