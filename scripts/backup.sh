#!/bin/bash
set -euo pipefail

# ============================================================
# Oftisoft PostgreSQL Backup Script
# - Dumps all databases to a timestamped SQL file
# - Compresses with gzip
# - Uploads to S3-compatible storage (Cloudflare R2)
# - Retains last N local backups
# - Can send Slack notification on failure
# ============================================================

# --- Configuration (override via environment variables) ---
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="oftisoft_backup_${TIMESTAMP}.sql.gz"
S3_BUCKET="${S3_BUCKET:-oftisoft-backups}"
S3_PREFIX="${S3_PREFIX:-postgres}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Database connection (uses same env vars as app)
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-oftisoft}"
DB_PASSWORD="${DATABASE_PASSWORD:-}"
DB_NAME="${DATABASE_NAME:-oftisoft}"
PG_CONN="${PG_CONN:-}"

# S3 credentials (reuses app's S3/R2 config)
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"
AWS_ENDPOINT="${AWS_ENDPOINT:-}"

# --- Helper functions ---
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
error() { log "ERROR: $*"; }

notify_slack() {
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local message="{\"text\":\"$1\"}"
        curl -s -X POST -H 'Content-type: application/json' --data "$message" "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
}

cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    find "$BACKUP_DIR" -name "oftisoft_backup_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete
    log "Cleanup complete."
}

# --- Validate prerequisites ---
command -v pg_dump >/dev/null 2>&1 || { error "pg_dump is required but not installed."; notify_slack "❌ Backup failed: pg_dump not found on $HOSTNAME"; exit 1; }
command -v aws >/dev/null 2>&1 || { log "aws CLI not found. Will skip S3 upload."; }
command -v gzip >/dev/null 2>&1 || { error "gzip is required but not installed."; exit 1; }

# --- Main ---
mkdir -p "$BACKUP_DIR"
log "Starting database backup..."

# Build connection string
if [ -z "$PG_CONN" ]; then
    export PGPASSWORD="$DB_PASSWORD"
    PG_CONN="-h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
fi

# Run pg_dump
BACKUP_PATH="${BACKUP_DIR}/${FILENAME}"
pg_dump $PG_CONN --no-owner --no-acl --format=custom 2>"${BACKUP_DIR}/backup_err_${TIMESTAMP}.log" | gzip > "$BACKUP_PATH"

# Verify backup
if [ ! -s "$BACKUP_PATH" ]; then
    error "Backup file is empty!"
    notify_slack "❌ Backup failed on $HOSTNAME: backup file is empty."
    exit 1
fi

# Get file size
FILESIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "Backup created: $BACKUP_PATH ($FILESIZE)"

# Upload to S3-compatible storage
if command -v aws >/dev/null 2>&1 && [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_ENDPOINT" ]; then
    log "Uploading to S3 (${AWS_ENDPOINT})..."
    aws s3 cp "$BACKUP_PATH" "s3://${S3_BUCKET}/${S3_PREFIX}/${FILENAME}" \
        --endpoint-url "$AWS_ENDPOINT" \
        --only-show-errors || {
        error "S3 upload failed (non-fatal)."
    }

    # Upload latest symlink marker
    echo "$FILENAME" | aws s3 cp - "s3://${S3_BUCKET}/${S3_PREFIX}/latest.txt" \
        --endpoint-url "$AWS_ENDPOINT" \
        --only-show-errors 2>/dev/null || true

    log "S3 upload complete."
else
    log "S3 upload skipped (aws CLI or credentials not configured)."
fi

# Cleanup old backups
cleanup_old_backups

# Cleanup error logs older than 1 day
find "$BACKUP_DIR" -name "backup_err_*.log" -mtime +1 -delete 2>/dev/null || true

log "Backup completed successfully."
notify_slack "✅ Backup successful on $HOSTNAME: ${FILENAME} (${FILESIZE})"
