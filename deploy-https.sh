#!/bin/bash

# HTTPS Deployment Script for DevBreak with Separate Subdomains
# Usage: ./deploy-https.sh

set -e

DOMAIN="devtri.xyz"
API_DOMAIN="api.devtri.xyz"
TUNNEL_NAME="devbreak-tunnel"
TUNNEL_ID="4b772a17-651c-437a-bc61-cfd699523e42"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_header "🚀 DevBreak HTTPS Deployment"
print_status "Frontend: https://$DOMAIN"
print_status "Backend API: https://$API_DOMAIN"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.cloudflare.yml down || true

# Build images
print_status "Building Docker images..."
docker build -t devbreak-backend:latest ./app-server
docker build -t devbreak-frontend:latest ./app-ui

# Start application services
print_status "Starting application services..."
docker-compose -f docker-compose.cloudflare.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Update Cloudflare tunnel configuration
print_status "Updating Cloudflare tunnel configuration..."
mkdir -p /home/devtrantrongtri/.cloudflared
cat > /home/devtrantrongtri/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /home/devtrantrongtri/.cloudflared/$TUNNEL_ID.json

ingress:
  # Frontend (Next.js)
  - hostname: $DOMAIN
    service: http://localhost:80
    originRequest:
      httpHostHeader: $DOMAIN
  # Backend API (NestJS)
  - hostname: $API_DOMAIN
    service: http://localhost:80
    originRequest:
      httpHostHeader: $API_DOMAIN
  # Catch-all rule (required)
  - service: http_status:404
EOF

# Validate tunnel configuration
print_status "Validating tunnel configuration..."
if cloudflared tunnel ingress validate; then
    print_status "✅ Tunnel configuration is valid"
else
    print_error "❌ Tunnel configuration validation failed"
    exit 1
fi

# Restart Cloudflare tunnel service
print_status "Restarting Cloudflare tunnel service..."
sudo systemctl restart cloudflared
sleep 10

# Check container status
print_status "Checking container status..."
docker-compose -f docker-compose.cloudflare.yml ps

# Test local services
print_status "Testing local services..."
if curl -f -s "http://localhost" > /dev/null 2>&1; then
    print_status "✅ Local frontend is responding"
else
    print_warning "⚠️  Local frontend test failed"
fi

# Check tunnel status
print_header "📊 Deployment Status"
echo "========================================"

# Container status
print_status "Container Status:"
docker-compose -f docker-compose.cloudflare.yml ps

# Tunnel status
print_status "Tunnel Status:"
sudo systemctl status cloudflared --no-pager -l | head -10

print_header "🎉 HTTPS Deployment completed!"
print_status "Your application is now available at:"
print_status "  - Frontend: https://$DOMAIN"
print_status "  - Backend API: https://$API_DOMAIN"
print_status "  - Health check: https://$API_DOMAIN/health"
print_status ""
print_status "SSL/TLS is handled by Cloudflare automatically"
print_status ""
print_status "Test commands:"
print_status "  - curl https://$DOMAIN"
print_status "  - curl https://$API_DOMAIN/health"
print_status ""
print_status "Useful commands:"
print_status "  - Check tunnel status: sudo systemctl status cloudflared"
print_status "  - View tunnel logs: sudo journalctl -u cloudflared -f"
print_status "  - View app logs: docker-compose -f docker-compose.cloudflare.yml logs -f"
print_status "  - Restart tunnel: sudo systemctl restart cloudflared"
print_status "  - Restart app: docker-compose -f docker-compose.cloudflare.yml restart"
print_status ""
print_status "🌐 Your DevBreak application is now live with HTTPS!"
