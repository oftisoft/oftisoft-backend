#!/bin/bash

# SSL Setup Script for api.oftisoft.com
# This version works with existing backend running on host

set -e

DOMAIN="api.oftisoft.com"
EMAIL="${SSL_EMAIL:-your-email@example.com}"
APP_DIR="/var/www/oftisoft-backend"
EXISTING_BACKEND_PORT="${EXISTING_BACKEND_PORT:-3000}"

echo "🔒 Setting up SSL for $DOMAIN with existing backend..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Detect docker-compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Using: $DOCKER_COMPOSE"

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get update
    apt-get install -y certbot
fi

# Create necessary directories
mkdir -p $APP_DIR/logs/nginx
mkdir -p /var/www/certbot
chmod -R 755 /var/www/certbot

# Check what's running on port 80
echo "🔍 Checking port 80..."
if lsof -i :80 &>/dev/null || netstat -tulpn | grep -q ":80 "; then
    echo "⚠️  Port 80 is in use. We need to temporarily stop the service for SSL setup."
    echo "📋 Services using port 80:"
    lsof -i :80 2>/dev/null || netstat -tulpn | grep ":80 " || true
    
    read -p "Do you want to temporarily stop the service on port 80? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Try to stop common services
        systemctl stop nginx 2>/dev/null || true
        systemctl stop apache2 2>/dev/null || true
        service nginx stop 2>/dev/null || true
        service apache2 stop 2>/dev/null || true
        echo "✅ Stopped services on port 80"
    else
        echo "❌ Cannot proceed without port 80. Exiting."
        exit 1
    fi
fi

# Start nginx with HTTP-only config
echo "🌐 Starting nginx with HTTP config..."
cd $APP_DIR

# Use HTTP config for SSL setup
cp nginx/nginx-http.conf nginx/nginx.conf

# Start only nginx (no backend needed for SSL setup)
echo "🐳 Starting nginx container..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d nginx || true

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to be ready..."
sleep 10

# Check if nginx is running
if ! $DOCKER_COMPOSE -f docker-compose.prod.yml ps nginx | grep -q "Up"; then
    echo "⚠️  Nginx container is not running. Starting it..."
    $DOCKER_COMPOSE -f docker-compose.prod.yml up -d nginx
    sleep 10
fi

# Verify nginx is accessible
echo "🔍 Verifying nginx is accessible..."
if curl -I http://localhost/.well-known/acme-challenge/test 2>/dev/null | grep -q "404\|200"; then
    echo "✅ Nginx is responding"
else
    echo "⚠️  Nginx might not be ready. Checking logs..."
    $DOCKER_COMPOSE -f docker-compose.prod.yml logs nginx | tail -20
fi

# Obtain SSL certificate
echo "📜 Obtaining SSL certificate from Let's Encrypt..."
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Configure nginx for existing backend
echo "✅ Configuring nginx for existing backend..."
echo "📝 Your existing backend port: $EXISTING_BACKEND_PORT"
echo "📝 To change it, set EXISTING_BACKEND_PORT environment variable"

# Use existing backend config
if [ -f "nginx/nginx-existing-backend.conf" ]; then
    # Replace placeholder with actual port
    sed "s/\${EXISTING_BACKEND_PORT:-3000}/$EXISTING_BACKEND_PORT/g" nginx/nginx-existing-backend.conf > nginx/nginx.conf
    echo "✅ Configured nginx to proxy to existing backend on port $EXISTING_BACKEND_PORT"
else
    echo "⚠️  nginx-existing-backend.conf not found. Using default config."
    git checkout nginx/nginx.conf 2>/dev/null || echo "⚠️  Please configure nginx.conf manually"
fi

# Reload nginx
echo "🔄 Reloading nginx with HTTPS config..."
$DOCKER_COMPOSE -f docker-compose.prod.yml restart nginx

# Test SSL
echo "🧪 Testing SSL configuration..."
sleep 3
if curl -I https://$DOMAIN/api/health &>/dev/null; then
    echo "✅ SSL is working correctly!"
else
    echo "⚠️  SSL test failed. Please check nginx logs: $DOCKER_COMPOSE -f docker-compose.prod.yml logs nginx"
fi

# Setup auto-renewal cron job
echo "⏰ Setting up auto-renewal..."
DOCKER_COMPOSE_CMD="$DOCKER_COMPOSE"
(crontab -l 2>/dev/null | grep -v "certbot renew" || true; echo "0 0 * * * cd $APP_DIR && $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec -T certbot certbot renew --quiet && $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml restart nginx") | crontab -

echo "✅ SSL setup completed!"
echo ""
echo "📋 Configuration:"
echo "   - Nginx is proxying to your existing backend on port $EXISTING_BACKEND_PORT"
echo "   - SSL is configured for $DOMAIN"
echo ""
echo "📋 Next steps:"
echo "1. Verify SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "2. Check nginx logs: $DOCKER_COMPOSE -f docker-compose.prod.yml logs nginx"
echo "3. To change backend port, edit nginx/nginx.conf and restart nginx"
