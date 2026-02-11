# SSL Setup with Alternative Ports

Since you have an existing backend running on port 80, this nginx is configured to use:
- **HTTP**: Port 8080 (external) → Port 80 (container internal)
- **HTTPS**: Port 8443 (external) → Port 443 (container internal)

## SSL Certificate Setup Options

### Option 1: Use Existing Nginx/Apache for SSL (Recommended)

If your existing backend uses nginx or apache, configure it to handle SSL for `api.oftisoft.com`:

```bash
# On your existing nginx/apache server, add this configuration:
# For nginx:
sudo nano /etc/nginx/sites-available/api.oftisoft.com

# Add location block for certbot:
location /.well-known/acme-challenge/ {
    root /var/www/certbot;
}

# Then get certificate:
sudo certbot certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d api.oftisoft.com

# Copy certificates to this project:
sudo cp /etc/letsencrypt/live/api.oftisoft.com/fullchain.pem /var/www/oftisoft-backend/
sudo cp /etc/letsencrypt/live/api.oftisoft.com/privkey.pem /var/www/oftisoft-backend/
```

### Option 2: Temporarily Use Port 80 for SSL Setup

1. **Temporarily stop existing service:**
```bash
sudo systemctl stop nginx  # or apache2
```

2. **Change docker-compose.prod.yml ports temporarily:**
```yaml
ports:
  - "80:80"    # Change from 8080:80
  - "443:443"  # Change from 8443:443
```

3. **Run SSL setup:**
```bash
sudo ./setup-ssl.sh
```

4. **After SSL setup, revert ports:**
```yaml
ports:
  - "8080:80"
  - "8443:443"
```

5. **Restart existing service:**
```bash
sudo systemctl start nginx  # or apache2
```

### Option 3: Use DNS-01 Challenge (No Port 80 Needed)

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.oftisoft.com
# Follow instructions to add TXT record to DNS
```

## Access Your API

After setup:
- **HTTP**: http://api.oftisoft.com:8080
- **HTTPS**: https://api.oftisoft.com:8443

Or configure your existing nginx/apache to reverse proxy:
- `api.oftisoft.com` → `localhost:8080` (HTTP) or `localhost:8443` (HTTPS)

## Update Frontend Configuration

Make sure your frontend points to:
- `https://api.oftisoft.com:8443` (or configure reverse proxy)
