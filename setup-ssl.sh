#!/bin/bash

# SSL Setup Script for api.oftisoft.com
# Run this script on your VPS to set up SSL certificates

set -e

DOMAIN="api.oftisoft.com"
EMAIL="${SSL_EMAIL:-your-email@example.com}"  # Set SSL_EMAIL environment variable or edit here
APP_DIR="/var/www/oftisoft-backend"

echo "🔒 Setting up SSL for $DOMAIN..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Detect docker-compose command (docker compose or docker-compose)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose not found. Please install Docker Compose."
    echo "Install: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
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

# Start nginx with HTTP-only config first
echo "🌐 Starting nginx with HTTP config..."
cd $APP_DIR

# Backup original nginx.conf if it exists
if [ -f "nginx/nginx.conf" ] && ! grep -q "ssl_certificate" "nginx/nginx.conf"; then
    cp nginx/nginx.conf nginx/nginx.conf.backup
fi

# Copy HTTP config temporarily
cp nginx/nginx-http.conf nginx/nginx.conf

# Check if port 80 is available
if lsof -i :80 > /dev/null 2>&1; then
    echo "⚠️  Port 80 is already in use!"
    echo "📋 Options:"
    echo "   1. Temporarily stop existing service: sudo systemctl stop nginx"
    echo "   2. Use existing nginx/apache for SSL certificate"
    echo "   3. Use DNS-01 challenge (no port 80 needed)"
    echo ""
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "SSL setup cancelled. You can configure SSL manually."
        exit 1
    fi
fi

# Start containers (if not running)
echo "🐳 Starting Docker containers..."
# For SSL setup, we only need nginx running initially
# Backend can be started later if DOCKER_USERNAME is not set
if [ -n "$DOCKER_USERNAME" ] || docker images | grep -q "oftisoft-backend"; then
    $DOCKER_COMPOSE -f docker-compose.prod.yml up -d nginx backend || $DOCKER_COMPOSE -f docker-compose.prod.yml up -d nginx || true
else
    echo "⚠️  DOCKER_USERNAME not set. Starting nginx only for SSL setup..."
    echo "⚠️  Backend will need to be built/started separately after SSL is configured."
    $DOCKER_COMPOSE -f docker-compose.prod.yml up -d nginx || true
fi

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

# Restore HTTPS config
echo "✅ Restoring HTTPS configuration..."
if [ -f "nginx/nginx.conf.backup" ]; then
    # Restore from backup if it was the original HTTPS config
    if grep -q "ssl_certificate" "nginx/nginx.conf.backup"; then
        cp nginx/nginx.conf.backup nginx/nginx.conf
    else
        # Use the HTTPS config from repository
        git checkout nginx/nginx.conf 2>/dev/null || cp nginx/nginx-http.conf nginx/nginx.conf
    fi
else
    # Use the HTTPS config from repository
    git checkout nginx/nginx.conf 2>/dev/null || echo "⚠️  Please ensure nginx/nginx.conf has SSL configuration"
fi

# Verify SSL config exists
if ! grep -q "ssl_certificate" "nginx/nginx.conf"; then
    echo "⚠️  Warning: nginx.conf doesn't have SSL config. Please ensure nginx/nginx.conf has SSL configuration."
    echo "📝 You may need to manually restore the HTTPS config from your repository."
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
    echo "⚠️  SSL test failed. Please check nginx logs: docker-compose -f docker-compose.prod.yml logs nginx"
fi

# Setup auto-renewal cron job
echo "⏰ Setting up auto-renewal..."
DOCKER_COMPOSE_CMD="$DOCKER_COMPOSE"
(crontab -l 2>/dev/null | grep -v "certbot renew" || true; echo "0 0 * * * cd $APP_DIR && $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec -T certbot certbot renew --quiet && $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml restart nginx") | crontab -

echo "✅ SSL setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your DNS A record points $DOMAIN to this server's IP"
echo "2. Verify SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "3. Check nginx logs: docker-compose -f docker-compose.prod.yml logs nginx"
