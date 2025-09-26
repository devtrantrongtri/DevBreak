#!/bin/bash

# Setup Cloudflare Tunnel for DevBreak
# Usage: ./setup-cloudflare.sh

set -e

DOMAIN="devtri.xyz"
TUNNEL_NAME="devbreak-tunnel"

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
    echo -e "${BLUE}[CLOUDFLARE]${NC} $1"
}

print_header "🌐 Setting up Cloudflare Tunnel for DevBreak"

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    print_error "cloudflared is not installed. Installing..."
    
    # Download and install cloudflared
    wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
    
    print_status "✅ cloudflared installed successfully"
fi

# Check if already logged in
if [ ! -f "/home/devtrantrongtri/.cloudflared/cert.pem" ]; then
    print_error "Not logged in to Cloudflare. Please run: cloudflared tunnel login"
    exit 1
fi

print_status "✅ Already logged in to Cloudflare"

# Create tunnel if it doesn't exist
print_status "Creating Cloudflare tunnel: $TUNNEL_NAME"
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    print_warning "Tunnel $TUNNEL_NAME already exists"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
else
    TUNNEL_ID=$(cloudflared tunnel create $TUNNEL_NAME | grep -o '[a-f0-9-]\{36\}')
    print_status "✅ Created tunnel: $TUNNEL_ID"
fi

print_status "Tunnel ID: $TUNNEL_ID"

# Create config directory
mkdir -p /home/devtrantrongtri/.cloudflared

# Create tunnel configuration
print_status "Creating tunnel configuration..."
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

print_status "✅ Created tunnel configuration"

# Create DNS records
print_status "Creating DNS records..."
cloudflared tunnel route dns $TUNNEL_ID $DOMAIN
cloudflared tunnel route dns $TUNNEL_ID api.$DOMAIN

print_status "✅ DNS records created"

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/cloudflared.service > /dev/null << EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=devtrantrongtri
ExecStart=/usr/local/bin/cloudflared tunnel run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

print_status "✅ Cloudflare tunnel service created and started"

# Check status
print_header "📊 Tunnel Status"
sudo systemctl status cloudflared --no-pager -l

print_header "🎉 Cloudflare Tunnel Setup Complete!"
print_status "Your application will be available at:"
print_status "  - Main site: https://$DOMAIN"
print_status "  - API: https://api.$DOMAIN"
print_status ""
print_status "Useful commands:"
print_status "  - Check tunnel status: sudo systemctl status cloudflared"
print_status "  - View tunnel logs: sudo journalctl -u cloudflared -f"
print_status "  - Restart tunnel: sudo systemctl restart cloudflared"
print_status "  - List tunnels: cloudflared tunnel list"
