#!/bin/bash
set -euo pipefail

# ============================================================
# Oftisoft Database Restore Script
# Usage: ./scripts/backup-restore.sh <backup_file>
#   - backup_file: path to .sql.gz backup file
# ============================================================

if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Examples:"
    echo "  $0 ./backups/oftisoft_backup_20250101_000000.sql.gz"
    echo "  aws s3 cp s3://oftisoft-backups/postgres/latest.txt - | xargs -I {} aws s3 cp s3://oftisoft-backups/postgres/{} ./ && ./$0 ./{}"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Database connection
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-oftisoft}"
DB_PASSWORD="${DATABASE_PASSWORD:-}"
DB_NAME="${DATABASE_NAME:-oftisoft}"

command -v pg_restore >/dev/null 2>&1 || { echo "ERROR: pg_restore is required."; exit 1; }

echo "WARNING: This will OVERWRITE the database '$DB_NAME' on $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
read -rp "Are you sure? (type 'yes' to confirm): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

export PGPASSWORD="$DB_PASSWORD"

echo "Starting restore..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --clean --no-owner --no-acl --verbose
else
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --clean --no-owner --no-acl --verbose "$BACKUP_FILE"
fi

echo "Restore completed successfully."
