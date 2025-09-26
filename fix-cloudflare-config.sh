#!/bin/bash

# Fix Cloudflare Config Script
# Usage: ./fix-cloudflare-config.sh

TUNNEL_ID="4b772a17-651c-437a-bc61-cfd699523e42"
DOMAIN="devtri.xyz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[FIX]${NC} $1"
}

print_header "🔧 Fixing Cloudflare Configuration"

# Backup existing config
if [ -f "/home/devtrantrongtri/.cloudflared/config.yml" ]; then
    print_status "Backing up existing config..."
    cp /home/devtrantrongtri/.cloudflared/config.yml /home/devtrantrongtri/.cloudflared/config.yml.backup
fi

# Create correct config
print_status "Creating correct tunnel configuration..."
mkdir -p /home/devtrantrongtri/.cloudflared

cat > /home/devtrantrongtri/.cloudflared/config.yml << 'EOF'
tunnel: 4b772a17-651c-437a-bc61-cfd699523e42
credentials-file: /home/devtrantrongtri/.cloudflared/4b772a17-651c-437a-bc61-cfd699523e42.json

ingress:
  - hostname: devtri.xyz
    service: http://localhost:80
  - hostname: api.devtri.xyz
    service: http://localhost:80
  - service: http_status:404
EOF

print_status "✅ Fixed tunnel configuration"

# Validate config
print_status "Validating configuration..."
if cloudflared tunnel ingress validate; then
    print_status "✅ Configuration is valid"
else
    print_status "❌ Configuration validation failed"
    exit 1
fi

# Create DNS records
print_status "Creating DNS records..."
cloudflared tunnel route dns $TUNNEL_ID $DOMAIN || print_status "DNS record may already exist"
cloudflared tunnel route dns $TUNNEL_ID api.$DOMAIN || print_status "API DNS record may already exist"

print_status "✅ DNS records processed"

print_header "🎉 Configuration fixed! You can now run: ./deploy-cloudflare.sh"
