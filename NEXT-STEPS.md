# Next Steps - SSL Setup

## ✅ DNS Record Added Successfully!

আপনার DNS record সেটআপ হয়েছে:
- **Subdomain**: api.oftisoft.com
- **IP Address**: 31.220.55.68
- **TTL**: 60 seconds

## ধাপ ১: DNS Propagation Check করুন

DNS propagate হতে 5-30 মিনিট সময় লাগতে পারে। Check করুন:

```bash
# VPS এ SSH করে test করুন
dig api.oftisoft.com +short
# Expected output: 31.220.55.68

# অথবা
nslookup api.oftisoft.com
```

**Online Check:**
- https://dnschecker.org/#A/api.oftisoft.com
- https://www.whatsmydns.net/#A/api.oftisoft.com

## ধাপ ২: Docker Containers Start করুন

```bash
cd /path/to/oftisoft-backend

# Containers start করুন
docker compose -f docker-compose.prod.yml up -d

# Status check করুন
docker compose -f docker-compose.prod.yml ps

# Logs check করুন
docker compose -f docker-compose.prod.yml logs -f
```

## ধাপ ৩: Port 8080 Test করুন

```bash
# Local test
curl http://localhost:8080/api/health

# Expected: HTTP response (200, 404, বা error - যাই হোক response আসা উচিত)
```

## ধাপ ৪: SSL Setup করুন

### Option A: Automated Script (সবচেয়ে সহজ)

```bash
# Script executable করুন
chmod +x setup-reverse-proxy-ssl.sh

# Email set করুন
export SSL_EMAIL="your-email@example.com"

# Script run করুন
sudo ./setup-reverse-proxy-ssl.sh
```

### Option B: Manual Setup

`REVERSE-PROXY-SETUP-BD.md` ফাইল দেখুন - step by step instructions আছে।

## ধাপ ৫: SSL Test করুন

```bash
# HTTPS test
curl -I https://api.oftisoft.com/api/health

# Browser এ test করুন
# https://api.oftisoft.com
```

## Troubleshooting

### DNS Not Propagated Yet?
- 10-15 মিনিট অপেক্ষা করুন
- Different DNS server try করুন: `dig @8.8.8.8 api.oftisoft.com`

### Port 8080 Not Accessible?
```bash
# Docker container check
docker compose -f docker-compose.prod.yml ps

# Port check
sudo netstat -tlnp | grep 8080
```

### SSL Certificate Error?
- DNS propagation complete হয়েছে কিনা verify করুন
- Port 80 accessible আছে কিনা check করুন
- Existing nginx/apache logs check করুন

## Quick Commands Reference

```bash
# DNS Check
dig api.oftisoft.com +short

# Docker Status
docker compose -f docker-compose.prod.yml ps

# Docker Logs
docker compose -f docker-compose.prod.yml logs -f

# Port Test
curl http://localhost:8080/api/health

# SSL Test
curl -I https://api.oftisoft.com/api/health
```

## Expected Timeline

1. ✅ DNS Record Added (Done!)
2. ⏳ DNS Propagation: 5-30 minutes
3. ⏳ SSL Setup: 5-10 minutes
4. ✅ Complete!

---

**আপনার VPS IP**: 31.220.55.68
**Subdomain**: api.oftisoft.com

DNS propagate হলে SSL setup শুরু করুন! 🚀
