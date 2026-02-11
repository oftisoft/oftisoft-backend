#!/bin/bash

# Check what web server is running on the VPS

echo "🔍 Checking web server status..."
echo ""

# Check nginx
if command -v nginx &> /dev/null; then
    echo "✅ Nginx is installed"
    if systemctl is-active --quiet nginx; then
        echo "   Status: ✅ Running"
    else
        echo "   Status: ⚠️  Installed but not running"
    fi
else
    echo "❌ Nginx is not installed"
fi

echo ""

# Check apache2
if command -v apache2 &> /dev/null; then
    echo "✅ Apache2 is installed"
    if systemctl is-active --quiet apache2; then
        echo "   Status: ✅ Running"
    else
        echo "   Status: ⚠️  Installed but not running"
    fi
else
    echo "❌ Apache2 is not installed"
fi

echo ""

# Check what's using port 80
echo "🔍 Checking port 80..."
if sudo lsof -i :80 2>/dev/null | grep -q LISTEN; then
    echo "✅ Port 80 is in use:"
    sudo lsof -i :80 | grep LISTEN
else
    echo "⚠️  Port 80 is not in use"
fi

echo ""

# Check what's using port 443
echo "🔍 Checking port 443..."
if sudo lsof -i :443 2>/dev/null | grep -q LISTEN; then
    echo "✅ Port 443 is in use:"
    sudo lsof -i :443 | grep LISTEN
else
    echo "⚠️  Port 443 is not in use"
fi

echo ""

# Check Docker containers
echo "🔍 Checking Docker containers..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    if docker ps | grep -q nginx; then
        echo "   Docker nginx containers:"
        docker ps | grep nginx
    fi
else
    echo "❌ Docker is not installed"
fi

echo ""
echo "📋 Summary:"
echo "If nginx/apache is installed but not running, start it with:"
echo "  sudo systemctl start nginx"
echo "  sudo systemctl start apache2"
echo ""
echo "If nginx/apache is not installed, install it with:"
echo "  sudo apt update && sudo apt install -y nginx"
echo "  sudo systemctl start nginx"
echo "  sudo systemctl enable nginx"
