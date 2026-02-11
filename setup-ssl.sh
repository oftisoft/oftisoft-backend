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

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get update
    apt-get install -y certbot
fi

# Create necessary directories
mkdir -p $APP_DIR/logs/nginx
mkdir -p /var/www/certbot

# Start nginx with HTTP-only config first
echo "🌐 Starting nginx with HTTP config..."
cd $APP_DIR

# Copy HTTP config temporarily
cp nginx/nginx-http.conf nginx/nginx.conf

# Start containers (if not running)
docker-compose -f docker-compose.prod.yml up -d nginx backend || true

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to be ready..."
sleep 5

# Obtain SSL certificate
echo "📜 Obtaining SSL certificate from Let's Encrypt..."
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

# Restore HTTPS config
echo "✅ Restoring HTTPS configuration..."
cp nginx/nginx.conf nginx/nginx-https-backup.conf 2>/dev/null || true
# The nginx.conf should already have HTTPS config, but let's make sure
if [ ! -f "nginx/nginx.conf" ] || ! grep -q "ssl_certificate" "nginx/nginx.conf"; then
    echo "⚠️  Warning: nginx.conf doesn't have SSL config. Please ensure nginx/nginx.conf has SSL configuration."
fi

# Reload nginx
echo "🔄 Reloading nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

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
(crontab -l 2>/dev/null; echo "0 0 * * * cd $APP_DIR && docker-compose -f docker-compose.prod.yml exec certbot certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx") | crontab -

echo "✅ SSL setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your DNS A record points $DOMAIN to this server's IP"
echo "2. Verify SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "3. Check nginx logs: docker-compose -f docker-compose.prod.yml logs nginx"
