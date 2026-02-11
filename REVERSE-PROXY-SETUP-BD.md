# Reverse Proxy SSL Setup - api.oftisoft.com

যেহেতু আপনার VPS এ ইতিমধ্যে backend/frontend/dashboard চলছে, তাই আমরা reverse proxy setup করব।

## Architecture

```
Internet → Existing Nginx/Apache (Port 80/443) → Docker Nginx (Port 8080/8443) → Backend (Port 5050)
```

## ধাপ ১: DNS Setup

আপনার domain provider এ (যেখানে DNS manage করেন) এই A record add করুন:

```
Type: A
Name: api
Value: YOUR_VPS_IP
TTL: 3600
```

DNS check করুন:
```bash
dig api.oftisoft.com +short
```

## ধাপ ২: Existing Nginx/Apache Configuration

আপনার existing nginx/apache এ reverse proxy configuration add করুন:

### Nginx Configuration (যদি Nginx ব্যবহার করেন)

```bash
# Configuration file create করুন
sudo nano /etc/nginx/sites-available/api.oftisoft.com
```

এই configuration add করুন:

```nginx
# HTTP Server - Let's Encrypt challenge এবং redirect
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
```

### Apache Configuration (যদি Apache ব্যবহার করেন)

```bash
# Configuration file create করুন
sudo nano /etc/apache2/sites-available/api.oftisoft.com.conf
```

```apache
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
```

## ধাপ ৩: SSL Certificate Obtain করুন

### Nginx এর জন্য:

```bash
# 1. Certbot directory তৈরি করুন
sudo mkdir -p /var/www/certbot

# 2. Temporary HTTP config enable করুন (ACME challenge এর জন্য)
sudo ln -s /etc/nginx/sites-available/api.oftisoft.com /etc/nginx/sites-enabled/

# 3. Nginx test করুন
sudo nginx -t

# 4. Nginx reload করুন
sudo systemctl reload nginx

# 5. SSL certificate obtain করুন
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d api.oftisoft.com

# 6. SSL config verify করুন
sudo nginx -t

# 7. Nginx reload করুন
sudo systemctl reload nginx
```

### Apache এর জন্য:

```bash
# 1. Certbot directory তৈরি করুন
sudo mkdir -p /var/www/certbot

# 2. Site enable করুন
sudo a2ensite api.oftisoft.com.conf

# 3. SSL module enable করুন
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers

# 4. Apache test করুন
sudo apache2ctl configtest

# 5. Apache reload করুন
sudo systemctl reload apache2

# 6. SSL certificate obtain করুন
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d api.oftisoft.com

# 7. Apache reload করুন
sudo systemctl reload apache2
```

## ধাপ ৪: Docker Containers Start করুন

```bash
cd /path/to/oftisoft-backend

# Docker containers start করুন
docker compose -f docker-compose.prod.yml up -d

# Status check করুন
docker compose -f docker-compose.prod.yml ps

# Logs check করুন
docker compose -f docker-compose.prod.yml logs -f
```

## ধাপ ৫: Test করুন

```bash
# HTTP test (redirect check)
curl -I http://api.oftisoft.com

# HTTPS test
curl -I https://api.oftisoft.com/api/health

# Browser এ test করুন
# https://api.oftisoft.com
```

## ধাপ ৬: Auto-Renewal Setup করুন

SSL certificate auto-renewal এর জন্য:

```bash
# Crontab edit করুন
sudo crontab -e

# এই line add করুন (Nginx এর জন্য):
0 0 * * * certbot renew --quiet && systemctl reload nginx

# অথবা Apache এর জন্য:
0 0 * * * certbot renew --quiet && systemctl reload apache2
```

## Troubleshooting

### Problem: 502 Bad Gateway

**Solution:**
```bash
# Docker container running কিনা check করুন
docker compose -f docker-compose.prod.yml ps

# Port 8080 accessible কিনা check করুন
curl http://localhost:8080/api/health

# Nginx logs check করুন
sudo tail -f /var/log/nginx/error.log
```

### Problem: SSL Certificate Error

**Solution:**
```bash
# Certificate path check করুন
sudo ls -la /etc/letsencrypt/live/api.oftisoft.com/

# Certificate validity check করুন
sudo certbot certificates

# Nginx/Apache config syntax check করুন
sudo nginx -t  # Nginx
sudo apache2ctl configtest  # Apache
```

### Problem: Connection Refused

**Solution:**
```bash
# Docker container logs check করুন
docker compose -f docker-compose.prod.yml logs backend

# Port binding check করুন
sudo netstat -tlnp | grep 8080

# Firewall check করুন
sudo ufw status
```

## Port Summary

- **Existing Services**: Port 80 (HTTP), Port 443 (HTTPS)
- **Docker Nginx**: Port 8080 (HTTP), Port 8443 (HTTPS)
- **Backend API**: Port 5050 (internal Docker network)

## Final Architecture

```
Internet (Port 80/443)
    ↓
Existing Nginx/Apache (SSL Termination)
    ↓ (Reverse Proxy)
Docker Nginx (Port 8080/8443)
    ↓
Backend Container (Port 5050)
```

## সফল হলে:

✅ `https://api.oftisoft.com` কাজ করবে
✅ SSL certificate valid থাকবে
✅ HTTP automatically HTTPS এ redirect হবে
✅ Existing services unaffected থাকবে
