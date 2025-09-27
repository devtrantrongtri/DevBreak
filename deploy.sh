#!/bin/bash

# DevBreak Production Deployment Script
# Usage: ./deploy.sh [--rebuild] [--clean]
# Options:
#   --rebuild: Force rebuild all Docker images
#   --clean: Clean all containers and volumes (WARNING: Will lose data)

set -e

DOMAIN="devtri.xyz"
API_DOMAIN="api.devtri.xyz"
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

# Parse command line arguments
REBUILD=false
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild)
            REBUILD=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: ./deploy.sh [--rebuild] [--clean]"
            exit 1
            ;;
    esac
done

print_header "🚀 DevBreak Production Deployment"
print_status "Frontend: https://$DOMAIN"
print_status "Backend API: https://$API_DOMAIN"

# Clean deployment (if requested)
if [ "$CLEAN" = true ]; then
    print_warning "⚠️  CLEAN DEPLOYMENT - This will remove all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing all containers..."
        docker-compose -f docker-compose.cloudflare.yml down -v
        docker system prune -f
        docker volume prune -f
        print_status "✅ Clean completed"
    else
        print_status "Clean cancelled"
        exit 0
    fi
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.cloudflare.yml down

# Rebuild images (if requested or if images don't exist)
if [ "$REBUILD" = true ] || [ -z "$(docker images -q devbreak-backend:latest)" ] || [ -z "$(docker images -q devbreak-frontend:latest)" ]; then
    print_status "Building Docker images..."
    docker-compose -f docker-compose.cloudflare.yml build
else
    print_status "Using existing Docker images (use --rebuild to force rebuild)"
fi

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.cloudflare.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check database connection
print_status "Checking database connection..."
for i in {1..30}; do
    if docker exec devbreak_backend npm run typeorm:show > /dev/null 2>&1; then
        print_status "✅ Database connection successful"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "⚠️  Database connection timeout"
    fi
    sleep 2
done

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

# Restart Cloudflare tunnel
print_status "Restarting Cloudflare tunnel..."
sudo systemctl restart cloudflared
sleep 10

# Health checks
print_status "Performing health checks..."

# Check containers
print_status "Container Status:"
docker-compose -f docker-compose.cloudflare.yml ps

# Test local endpoints
if curl -f -s "http://localhost/health" > /dev/null 2>&1; then
    print_status "✅ Backend health check passed"
else
    print_warning "⚠️  Backend health check failed"
fi

if curl -f -s "http://localhost" > /dev/null 2>&1; then
    print_status "✅ Frontend health check passed"
else
    print_warning "⚠️  Frontend health check failed"
fi

# Test external endpoints
sleep 5
if curl -f -s "https://$API_DOMAIN/health" > /dev/null 2>&1; then
    print_status "✅ External API health check passed"
else
    print_warning "⚠️  External API health check failed"
fi

if curl -f -s "https://$DOMAIN" > /dev/null 2>&1; then
    print_status "✅ External frontend health check passed"
else
    print_warning "⚠️  External frontend health check failed"
fi

print_header "🎉 Deployment completed!"
print_status ""
print_status "🌐 Your application is now live:"
print_status "  - Frontend: https://$DOMAIN"
print_status "  - Backend API: https://$API_DOMAIN"
print_status "  - API Documentation: https://$API_DOMAIN/api"
print_status "  - Health Check: https://$API_DOMAIN/health"
print_status ""
print_status "📊 Monitoring commands:"
print_status "  - View logs: docker-compose -f docker-compose.cloudflare.yml logs -f"
print_status "  - Check status: docker-compose -f docker-compose.cloudflare.yml ps"
print_status "  - Tunnel status: sudo systemctl status cloudflared"
print_status "  - Tunnel logs: sudo journalctl -u cloudflared -f"
print_status ""
print_status "🔄 Update commands:"
print_status "  - Quick update: ./deploy.sh"
print_status "  - Force rebuild: ./deploy.sh --rebuild"
print_status "  - Clean deploy: ./deploy.sh --clean (⚠️  Removes all data)"
