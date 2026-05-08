# Cloudflare SSL Configuration

## Setup Instructions

1. **Get Origin Certificates from Cloudflare:**
   - Go to Cloudflare Dashboard → Your Domain → SSL/TLS → Origin Server
   - Click "Create Certificate"
   - Select "Let Cloudflare generate a private key and a CSR"
   - Choose validity period (15 years recommended)
   - Save both files:
     - `cert.pem` (origin certificate)
     - `key.pem` (private key)

2. **Place Certificates:**
   - Copy `cert.pem` and `key.pem` to this directory
   - Ensure permissions are restricted: `chmod 600 key.pem`

3. **Cloudflare SSL Mode:**
   - Go to SSL/TLS → Overview
   - Set encryption mode to **Full (strict)**
   - This ensures encrypted connection between Cloudflare and your origin

4. **Environment Variables:**
   The following are already configured in `.env`:
   ```
   SSL_CERT_PATH=/app/ssl/cert.pem
   SSL_KEY_PATH=/app/ssl/key.pem
   TRUST_PROXY=true
   SECURE_COOKIES=true
   ```

## Security Notes

- Never commit certificates to version control
- Add `ssl/*.pem` to `.gitignore`
- Keep private keys secure and backed up
- Rotate certificates periodically (every 15 years with Cloudflare)
