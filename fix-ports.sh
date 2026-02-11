#!/bin/bash

# Script to fix port conflicts and check for issues

echo "🔍 Checking what's using port 80..."

# Check port 80
if sudo lsof -i :80 2>/dev/null | grep -q LISTEN; then
    echo "⚠️  Port 80 is in use:"
    sudo lsof -i :80
    echo ""
    echo "Stopping services that might be using port 80..."
    sudo systemctl stop nginx 2>/dev/null || true
    sudo systemctl stop apache2 2>/dev/null || true
    sudo service nginx stop 2>/dev/null || true
    sudo service apache2 stop 2>/dev/null || true
fi

# Check port 443
if sudo lsof -i :443 2>/dev/null | grep -q LISTEN; then
    echo "⚠️  Port 443 is in use:"
    sudo lsof -i :443
fi

# Check for DSS variable in .env
if [ -f ".env" ]; then
    echo ""
    echo "🔍 Checking .env file for DSS variable..."
    if grep -i "DSS" .env; then
        echo "⚠️  Found DSS variable in .env file. Please check for typos."
        echo "Common typos: DSS instead of SSL, or incomplete variable names"
    else
        echo "✅ No DSS variable found in .env"
    fi
fi

# Stop existing docker containers
echo ""
echo "🛑 Stopping existing Docker containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

echo ""
echo "✅ Port check completed!"
echo ""
echo "Now you can run: sudo ./setup-ssl.sh"
