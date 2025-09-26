#!/bin/bash

# Update Server IP Script for DevBreak
# Usage: ./update-server-ip.sh [NEW_IP]

NEW_IP=$1

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
    echo -e "${BLUE}[UPDATE]${NC} $1"
}

if [ -z "$NEW_IP" ]; then
    print_error "Usage: $0 [NEW_IP]"
    echo ""
    echo "Examples:"
    echo "  $0 192.168.1.100"
    echo "  $0 100.64.1.2"
    echo ""
    
    # Try to detect current IP
    print_header "Detected IP addresses:"
    echo "Local IPs:"
    ip addr show | grep -E "inet [0-9]" | grep -v "127.0.0.1" | awk '{print "  - " $2}' | sed 's/\/.*$//'
    
    if command -v tailscale &> /dev/null; then
        echo "Tailscale IP:"
        tailscale_ip=$(tailscale ip 2>/dev/null || echo "Not available")
        echo "  - $tailscale_ip"
    fi
    
    exit 1
fi

print_header "🔄 Updating DevBreak Server IP to: $NEW_IP"

# Backup current env file
if [ -f "app-ui/.env.production" ]; then
    print_status "Creating backup of current .env.production..."
    cp app-ui/.env.production app-ui/.env.production.backup.$(date +%Y%m%d_%H%M%S)
fi

# Update frontend environment
print_status "Updating frontend environment file..."
if [ -f "app-ui/.env.production" ]; then
    # Replace any existing API URL
    sed -i.tmp "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$NEW_IP/api|g" app-ui/.env.production
    rm -f app-ui/.env.production.tmp
    print_status "✅ Updated app-ui/.env.production"
else
    print_warning "app-ui/.env.production not found, creating new one..."
    cat > app-ui/.env.production << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://$NEW_IP/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=DevBreak
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
    print_status "✅ Created app-ui/.env.production"
fi

# Show current configuration
print_header "📋 Current Configuration:"
echo "Frontend API URL: $(grep NEXT_PUBLIC_API_URL app-ui/.env.production)"

# Ask if user wants to rebuild and redeploy
echo ""
print_header "🚀 Next Steps:"
echo "1. Rebuild frontend image: ./build-images.sh"
echo "2. Redeploy application: ./deploy-production.sh $NEW_IP"
echo ""

read -p "Do you want to rebuild and redeploy now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Rebuilding images..."
    ./build-images.sh
    
    print_status "Redeploying application..."
    ./deploy-production.sh $NEW_IP
else
    print_status "IP updated. Run the following commands when ready:"
    echo "  ./build-images.sh"
    echo "  ./deploy-production.sh $NEW_IP"
fi

print_header "✅ Server IP update completed!"
