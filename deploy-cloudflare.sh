#!/bin/bash

# Cloudflare Deployment Script for DevBreak
# Usage: ./deploy-cloudflare.sh

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
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_header "🚀 DevBreak Cloudflare Deployment"
print_status "Domain: $DOMAIN"

# Check if cloudflared is installed and logged in
if ! command -v cloudflared &> /dev/null; then
    print_error "cloudflared is not installed. Please run: ./setup-cloudflare.sh first"
    exit 1
fi

if [ ! -f "/home/devtrantrongtri/.cloudflared/cert.pem" ]; then
    print_error "Not logged in to Cloudflare. Please run: cloudflared tunnel login"
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.cloudflare.yml down || true

# Build images if they don't exist
print_status "Checking for existing images..."
if ! docker images | grep -q "devbreak-backend"; then
    print_warning "Backend image not found. Building..."
    cd app-server
    docker build -t devbreak-backend:latest .
    cd ..
fi

if ! docker images | grep -q "devbreak-frontend"; then
    print_warning "Frontend image not found. Building..."
    cd app-ui
    docker build -t devbreak-frontend:latest .
    cd ..
fi

# Start application services
print_status "Starting application services..."
docker-compose -f docker-compose.cloudflare.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check container status
print_status "Checking container status..."
docker-compose -f docker-compose.cloudflare.yml ps

# Setup or check Cloudflare tunnel
print_status "Setting up Cloudflare tunnel..."

# Check if tunnel exists
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    print_status "✅ Tunnel $TUNNEL_NAME already exists"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
else
    print_status "Creating new tunnel: $TUNNEL_NAME"
    TUNNEL_ID=$(cloudflared tunnel create $TUNNEL_NAME | grep -o '[a-f0-9-]\{36\}')
    print_status "✅ Created tunnel: $TUNNEL_ID"
fi

# Create tunnel configuration if not exists
CONFIG_FILE="/home/devtrantrongtri/.cloudflared/config.yml"
if [ ! -f "$CONFIG_FILE" ]; then
    print_status "Creating tunnel configuration..."
    mkdir -p /home/devtrantrongtri/.cloudflared
    cat > $CONFIG_FILE << EOF
tunnel: $TUNNEL_ID
credentials-file: /home/devtrantrongtri/.cloudflared/$TUNNEL_ID.json

ingress:
  # Main application
  - hostname: $DOMAIN
    service: http://localhost:80
  
  # API subdomain (optional)
  - hostname: api.$DOMAIN
    service: http://localhost:80
    
  # Catch-all rule (required)
  - service: http_status:404
EOF
    print_status "✅ Created tunnel configuration"
fi

# Create DNS records if they don't exist
print_status "Checking DNS records..."
if ! cloudflared tunnel route dns $TUNNEL_ID $DOMAIN 2>/dev/null; then
    print_warning "DNS record for $DOMAIN may already exist"
fi

if ! cloudflared tunnel route dns $TUNNEL_ID api.$DOMAIN 2>/dev/null; then
    print_warning "DNS record for api.$DOMAIN may already exist"
fi

# Check if cloudflared service is running
if systemctl is-active --quiet cloudflared; then
    print_status "Restarting Cloudflare tunnel service..."
    sudo systemctl restart cloudflared
else
    print_status "Starting Cloudflare tunnel service..."
    
    # Create systemd service if it doesn't exist
    if [ ! -f "/etc/systemd/system/cloudflared.service" ]; then
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
        sudo systemctl daemon-reload
        sudo systemctl enable cloudflared
    fi
    
    sudo systemctl start cloudflared
fi

# Wait for tunnel to be ready
print_status "Waiting for tunnel to be ready..."
sleep 10

# Test local application
print_status "Testing local application..."
if curl -f -s "http://localhost" > /dev/null 2>&1; then
    print_status "✅ Local application is responding"
else
    print_warning "⚠️  Local application test failed"
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

print_header "🎉 Deployment completed!"
print_status "Your application is now available at:"
print_status "  - Main site: https://$DOMAIN"
print_status "  - API: https://api.$DOMAIN (optional)"
print_status ""
print_status "Useful commands:"
print_status "  - Check tunnel status: sudo systemctl status cloudflared"
print_status "  - View tunnel logs: sudo journalctl -u cloudflared -f"
print_status "  - View app logs: docker-compose -f docker-compose.cloudflare.yml logs -f"
print_status "  - Restart tunnel: sudo systemctl restart cloudflared"
print_status "  - Restart app: docker-compose -f docker-compose.cloudflare.yml restart"
print_status ""
print_status "🌐 Your DevBreak application is now live on the internet!"
