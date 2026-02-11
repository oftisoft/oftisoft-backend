#!/bin/bash

# Reverse Proxy SSL Setup Script for api.oftisoft.com
# This script helps set up SSL when you have existing services on port 80/443

set -e

DOMAIN="api.oftisoft.com"
EMAIL="${SSL_EMAIL:-your-email@example.com}"
WEBROOT="/var/www/certbot"

echo "🔒 Reverse Proxy SSL Setup for $DOMAIN"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Detect web server
if systemctl is-active --quiet nginx; then
    WEBSERVER="nginx"
    CONFIG_DIR="/etc/nginx/sites-available"
    ENABLE_CMD="ln -sf $CONFIG_DIR/api.oftisoft.com /etc/nginx/sites-enabled/"
    RELOAD_CMD="systemctl reload nginx"
    TEST_CMD="nginx -t"
elif systemctl is-active --quiet apache2; then
    WEBSERVER="apache"
    CONFIG_DIR="/etc/apache2/sites-available"
    ENABLE_CMD="a2ensite api.oftisoft.com.conf"
    RELOAD_CMD="systemctl reload apache2"
    TEST_CMD="apache2ctl configtest"
else
    echo "⚠️  No active web server detected (nginx/apache2)"
    echo "Please install nginx or apache2 first"
    exit 1
fi

echo "✅ Detected web server: $WEBSERVER"
echo ""

# Create certbot directory
echo "📁 Creating certbot directory..."
mkdir -p $WEBROOT
chmod -R 755 $WEBROOT

# Check if Docker containers are running
echo "🐳 Checking Docker containers..."
if docker compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "Up"; then
    echo "✅ Docker containers are running"
else
    echo "⚠️  Docker containers are not running"
    echo "Starting Docker containers..."
    cd /var/www/oftisoft-backend 2>/dev/null || cd $(dirname "$0")
    docker compose -f docker-compose.prod.yml up -d nginx || true
    sleep 5
fi

# Check if port 8080 is accessible
echo "🔍 Checking port 8080..."
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ Port 8080 is accessible"
else
    echo "⚠️  Port 8080 is not accessible"
    echo "Please ensure Docker containers are running:"
    echo "  docker compose -f docker-compose.prod.yml up -d"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create configuration file
echo "📝 Creating $WEBSERVER configuration..."

if [ "$WEBSERVER" = "nginx" ]; then
    CONFIG_FILE="$CONFIG_DIR/api.oftisoft.com"
    
    cat > $CONFIG_FILE << 'NGINX_CONFIG'
# HTTP Server - Let's Encrypt challenge and redirect
server {
    listen 80;
    server_name api.oftisoft.com;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }

    # All other requests redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server - Reverse Proxy
server {
    listen 443 ssl http2;
    server_name api.oftisoft.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.oftisoft.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.oftisoft.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Client body size (file uploads)
    client_max_body_size 50M;

    # Reverse Proxy to Docker Nginx
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
NGINX_CONFIG

elif [ "$WEBSERVER" = "apache" ]; then
    CONFIG_FILE="$CONFIG_DIR/api.oftisoft.com.conf"
    
    cat > $CONFIG_FILE << 'APACHE_CONFIG'
<VirtualHost *:80>
    ServerName api.oftisoft.com
    
    # Let's Encrypt ACME challenge
    Alias /.well-known/acme-challenge/ /var/www/certbot/.well-known/acme-challenge/
    
    <Directory /var/www/certbot>
        Options None
        AllowOverride None
        Require all granted
    </Directory>
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName api.oftisoft.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/api.oftisoft.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/api.oftisoft.com/privkey.pem
    
    # SSL Protocols
    SSLProtocol all -SSLv2 -SSLv3
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    
    # Reverse Proxy to Docker
    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
    
    # Headers
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
    
    # File upload size
    LimitRequestBody 52428800
</VirtualHost>
APACHE_CONFIG

    # Enable required Apache modules
    echo "🔧 Enabling Apache modules..."
    a2enmod ssl rewrite proxy proxy_http headers 2>/dev/null || true
fi

# Enable site
echo "🔗 Enabling site..."
eval $ENABLE_CMD

# Test configuration
echo "🧪 Testing configuration..."
if $TEST_CMD; then
    echo "✅ Configuration is valid"
else
    echo "❌ Configuration test failed"
    exit 1
fi

# Reload web server
echo "🔄 Reloading $WEBSERVER..."
$RELOAD_CMD

# Obtain SSL certificate
echo "📜 Obtaining SSL certificate..."
certbot certonly \
    --webroot \
    --webroot-path=$WEBROOT \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Reload web server again with SSL
echo "🔄 Reloading $WEBSERVER with SSL..."
$RELOAD_CMD

# Test SSL
echo "🧪 Testing SSL..."
sleep 3
if curl -I https://$DOMAIN/api/health 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✅ SSL is working correctly!"
else
    echo "⚠️  SSL test failed. Please check configuration manually."
fi

# Setup auto-renewal
echo "⏰ Setting up auto-renewal..."
(crontab -l 2>/dev/null | grep -v "certbot renew" || true; echo "0 0 * * * certbot renew --quiet && $RELOAD_CMD") | crontab -

echo ""
echo "✅ Reverse Proxy SSL Setup Completed!"
echo ""
echo "📋 Summary:"
echo "  - Domain: $DOMAIN"
echo "  - Web Server: $WEBSERVER"
echo "  - Docker Port: 8080"
echo "  - SSL Certificate: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "🔗 Test your API:"
echo "  https://$DOMAIN/api/health"
echo ""
echo "📝 Next steps:"
echo "  1. Verify DNS: dig $DOMAIN +short"
echo "  2. Test SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "  3. Check logs: sudo tail -f /var/log/$WEBSERVER/error.log"
