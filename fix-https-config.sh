#!/bin/bash

# Fix HTTPS Configuration Script for DevBreak
# Usage: ./fix-https-config.sh

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
    echo -e "${BLUE}[FIX]${NC} $1"
}

print_header "🔧 Fixing HTTPS Configuration for DevBreak"

# 1. Update Cloudflare tunnel config for separate subdomains
print_status "Updating Cloudflare tunnel configuration..."
cat > /home/devtrantrongtri/.cloudflared/config.yml << 'EOF'
tunnel: 4b772a17-651c-437a-bc61-cfd699523e42
credentials-file: /home/devtrantrongtri/.cloudflared/4b772a17-651c-437a-bc61-cfd699523e42.json

ingress:
  # Frontend
  - hostname: devtri.xyz
    service: http://localhost:80
  # Backend API
  - hostname: api.devtri.xyz
    service: http://localhost:80
  # Catch-all rule (required)
  - service: http_status:404
EOF

print_status "✅ Updated Cloudflare tunnel configuration"

# 2. Validate tunnel config
print_status "Validating tunnel configuration..."
if cloudflared tunnel ingress validate; then
    print_status "✅ Tunnel configuration is valid"
else
    print_error "❌ Tunnel configuration validation failed"
    exit 1
fi

# 3. Clean up Docker images
print_status "Cleaning up Docker images..."
docker rmi devbreak-backend:latest devbreak-frontend:latest 2>/dev/null || true
print_status "✅ Cleaned up Docker images"

# 4. Restart Cloudflare tunnel
print_status "Restarting Cloudflare tunnel..."
sudo systemctl restart cloudflared
sleep 5

# 5. Check tunnel status
print_status "Checking tunnel status..."
if sudo systemctl is-active --quiet cloudflared; then
    print_status "✅ Cloudflare tunnel is running"
else
    print_warning "⚠️  Cloudflare tunnel may not be running properly"
fi

print_header "🎉 HTTPS configuration fix completed!"
print_status "Configuration summary:"
print_status "  - Frontend: https://devtri.xyz (with HTTPS headers)"
print_status "  - Backend API: https://api.devtri.xyz (with HTTPS headers)"
print_status "  - Node.js version: 22 (latest)"
print_status "  - SSL/TLS: Handled by Cloudflare"
print_status ""
print_status "Next steps:"
print_status "  1. Run: ./deploy-cloudflare.sh"
print_status "  2. Test: curl https://devtri.xyz"
print_status "  3. Test: curl https://api.devtri.xyz/health"
