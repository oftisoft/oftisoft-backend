# DNS A Record Setup Guide - api.oftisoft.com

## ধাপ ১: আপনার VPS IP Address খুঁজে বের করুন

### VPS এ SSH করে IP check করুন:

```bash
# Method 1: ifconfig command
ifconfig

# Method 2: ip command
ip addr show

# Method 3: curl command
curl ifconfig.me
# অথবা
curl -4 ifconfig.me

# Method 4: hostname command
hostname -I
```

**আপনার VPS IP হবে:** `XXX.XXX.XXX.XXX` (এই format এ)

## ধাপ ২: Domain Provider এ DNS Record Add করুন

### Popular Domain Providers:

---

### **Namecheap** (যদি Namecheap থেকে domain কিনে থাকেন)

1. **Namecheap login করুন**: https://www.namecheap.com/
2. **Domain List** → আপনার domain (`oftisoft.com`) select করুন
3. **Advanced DNS** tab এ click করুন
4. **Add New Record** button click করুন
5. এই values fill করুন:
   ```
   Type: A Record
   Host: api
   Value: YOUR_VPS_IP_ADDRESS (যেমন: 192.168.1.100)
   TTL: Automatic (বা 300)
   ```
6. **Save** button click করুন

---

### **GoDaddy** (যদি GoDaddy থেকে domain কিনে থাকেন)

1. **GoDaddy login করুন**: https://www.godaddy.com/
2. **My Products** → **DNS** → আপনার domain select করুন
3. **Add** button click করুন
4. এই values fill করুন:
   ```
   Type: A
   Name: api
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 600 seconds (বা Auto)
   ```
5. **Save** button click করুন

---

### **Cloudflare** (যদি Cloudflare ব্যবহার করেন)

1. **Cloudflare Dashboard** → আপনার domain select করুন
2. **DNS** → **Records** section
3. **Add record** button click করুন
4. এই values fill করুন:
   ```
   Type: A
   Name: api
   IPv4 address: YOUR_VPS_IP_ADDRESS
   Proxy status: DNS only (gray cloud) - SSL এর জন্য
   TTL: Auto
   ```
5. **Save** button click করুন

**⚠️ Important**: Cloudflare এ **Proxy status** off রাখুন (gray cloud) SSL setup এর জন্য। পরে SSL setup হলে আপনি proxy on করতে পারেন।

---

### **Google Domains / Google Workspace**

1. **Google Domains** → আপনার domain select করুন
2. **DNS** section
3. **Custom resource records** → **Add** button
4. এই values fill করুন:
   ```
   DNS name: api
   Resource record type: A
   IPv4 address: YOUR_VPS_IP_ADDRESS
   TTL: 300 seconds
   ```
5. **Save** button click করুন

---

### **Name.com**

1. **Name.com login** → **My Domains** → আপনার domain
2. **DNS Records** tab
3. **Add Record** button
4. এই values fill করুন:
   ```
   Type: A
   Hostname: api
   Answer: YOUR_VPS_IP_ADDRESS
   TTL: 300
   ```
5. **Save** button click করুন

---

### **DigitalOcean** (যদি DigitalOcean DNS ব্যবহার করেন)

1. **DigitalOcean Dashboard** → **Networking** → **Domains**
2. আপনার domain select করুন
3. **Add Record** button
4. এই values fill করুন:
   ```
   Record Type: A
   Hostname: api
   Will Direct To: YOUR_VPS_IP_ADDRESS
   TTL: 300
   ```
5. **Create Record** button click করুন

---

### **AWS Route 53** (যদি AWS ব্যবহার করেন)

1. **AWS Console** → **Route 53** → **Hosted zones**
2. আপনার domain select করুন
3. **Create record** button
4. এই values fill করুন:
   ```
   Record name: api
   Record type: A
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 300
   ```
5. **Create records** button click করুন

---

### **Generic DNS Provider** (অন্য কোনো provider)

সাধারণত সব DNS provider এ এই format:

```
Record Type: A
Name/Host: api
Value/Points To/Answer: YOUR_VPS_IP_ADDRESS
TTL: 300 (বা Auto)
```

---

## ধাপ ৩: DNS Propagation Check করুন

DNS record add করার পর, propagation check করুন:

### Online Tools:

1. **DNS Checker**: https://dnschecker.org/
   - Domain: `api.oftisoft.com`
   - Type: A
   - Check করুন

2. **What's My DNS**: https://www.whatsmydns.net/
   - Domain: `api.oftisoft.com`
   - Type: A Record

### Command Line:

```bash
# Linux/Mac
dig api.oftisoft.com +short
# অথবা
nslookup api.oftisoft.com

# Windows
nslookup api.oftisoft.com

# Expected output: আপনার VPS IP address
```

### Propagation Time:

- **সাধারণত**: 5-30 মিনিট
- **Maximum**: 24-48 ঘণ্টা (কখনো কখনো)
- **Cloudflare**: 1-5 মিনিট (সবচেয়ে দ্রুত)

---

## ধাপ ৪: DNS Record Verify করুন

DNS propagate হওয়ার পর verify করুন:

```bash
# VPS এ SSH করে test করুন
curl -I http://api.oftisoft.com

# Expected: HTTP response (200, 301, বা 302)
```

---

## Example DNS Record:

```
Type: A
Name: api
Value: 192.168.1.100  (এটা example, আপনার actual VPS IP use করুন)
TTL: 300
```

**Result**: `api.oftisoft.com` → `192.168.1.100` এ point করবে

---

## Troubleshooting

### Problem: DNS not propagating

**Solution:**
- 30 মিনিট অপেক্ষা করুন
- DNS cache clear করুন: `sudo systemd-resolve --flush-caches` (Linux)
- Browser cache clear করুন
- Different DNS server try করুন: `dig @8.8.8.8 api.oftisoft.com`

### Problem: Wrong IP address

**Solution:**
- VPS IP double check করুন: `curl ifconfig.me`
- DNS record edit করুন এবং correct IP set করুন
- DNS propagation wait করুন

### Problem: CNAME conflict

**Solution:**
- যদি `api` subdomain এ আগে CNAME থাকে, তাহলে সেটা delete করুন
- A record add করার আগে CNAME remove করুন

---

## Next Steps:

DNS setup complete হলে:

1. ✅ DNS propagation wait করুন (5-30 মিনিট)
2. ✅ DNS verify করুন: `dig api.oftisoft.com +short`
3. ✅ SSL setup করুন: `sudo ./setup-reverse-proxy-ssl.sh`
4. ✅ Test করুন: `curl https://api.oftisoft.com/api/health`

---

## Quick Reference:

```bash
# VPS IP find করুন
curl ifconfig.me

# DNS check করুন
dig api.oftisoft.com +short

# DNS record format:
Type: A
Name: api
Value: [YOUR_VPS_IP]
TTL: 300
```
