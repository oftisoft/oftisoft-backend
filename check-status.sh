#!/bin/bash

# Status check script for oftisoft-backend

echo "🔍 Checking Docker containers status..."
echo "=========================================="
docker compose -f docker-compose.prod.yml ps || docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📊 Container Health Status..."
echo "=========================================="
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" || docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Checking Ports..."
echo "=========================================="
echo "Port 8080 (HTTP):"
netstat -tuln | grep :8080 || ss -tuln | grep :8080 || echo "Port 8080 not listening"

echo ""
echo "Port 8443 (HTTPS):"
netstat -tuln | grep :8443 || ss -tuln | grep :8443 || echo "Port 8443 not listening"

echo ""
echo "Port 5050 (Backend):"
netstat -tuln | grep :5050 || ss -tuln | grep :5050 || echo "Port 5050 not exposed (internal only)"

echo ""
echo "📝 Recent Nginx Logs..."
echo "=========================================="
docker compose -f docker-compose.prod.yml logs --tail=20 nginx 2>/dev/null || docker-compose -f docker-compose.prod.yml logs --tail=20 nginx 2>/dev/null || echo "No nginx logs"

echo ""
echo "📝 Recent Backend Logs..."
echo "=========================================="
docker compose -f docker-compose.prod.yml logs --tail=20 backend 2>/dev/null || docker-compose -f docker-compose.prod.yml logs --tail=20 backend 2>/dev/null || echo "No backend logs"

echo ""
echo "🏥 Health Check..."
echo "=========================================="
echo "Testing backend health endpoint..."
curl -s http://localhost:8080/api/health || curl -s http://localhost:5050/api/health || echo "Health check failed"

echo ""
echo "🔗 Testing API endpoints..."
echo "=========================================="
echo "Root endpoint:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/ || echo "Failed"

echo ""
echo "API endpoint:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/api/ || echo "Failed"

echo ""
echo "✅ Status check completed!"
