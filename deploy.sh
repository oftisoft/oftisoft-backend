#!/bin/bash

# VPS Deployment Script for Oftisoft Backend
# Place this file in your VPS and run: chmod +x deploy.sh && ./deploy.sh

set -e

echo "========================================="
echo "  Oftisoft Backend VPS Deployment"
echo "========================================="
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "Warning: Running as root. It's recommended to use a non-root user with sudo."
fi

# Check required files
echo "Checking required files..."
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found!"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it first."
    exit 1
fi

# Create SSL directory if not exists
if [ ! -d "ssl" ]; then
    echo "Creating SSL directory..."
    mkdir -p ssl
    echo "✓ SSL directory created"
    echo "  Note: Place your Cloudflare origin certificates here:"
    echo "  - ssl/cert.pem"
    echo "  - ssl/key.pem"
fi

# Create Docker network if not exists
echo "Checking Docker network..."
if ! docker network ls | grep -q "abs_app-network"; then
    echo "Creating Docker network: abs_app-network..."
    docker network create abs_app-network
    echo "✓ Network created"
else
    echo "✓ Network already exists"
fi

# Stop existing containers
echo ""
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo "✓ Containers stopped"

# Build and start
echo ""
echo "Building and starting containers..."
docker-compose up -d --build

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "Backend running on:"
echo "  - Local: http://localhost:5500"
echo "  - Docker: http://oftisoft-backend:5500"
echo ""
echo "API URL: https://api.oftisoft.com"
echo ""
echo "Useful commands:"
echo "  - View logs:    docker-compose logs -f"
echo "  - Stop:         docker-compose down"
echo "  - Restart:      docker-compose restart"
echo ""
echo "SSL Configuration:"
echo "  Place Cloudflare origin certificates in ./ssl/ directory"
echo ""
