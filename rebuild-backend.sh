#!/bin/bash

# Rebuild Backend Script for DevBreak
# Usage: ./rebuild-backend.sh

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
    echo -e "${BLUE}[REBUILD]${NC} $1"
}

print_header "🔧 Rebuilding Backend for DevBreak"

# 1. Stop backend container
print_status "Stopping backend container..."
docker-compose -f docker-compose.cloudflare.yml stop backend
print_status "✅ Stopped backend container"

# 2. Rebuild backend image
print_status "Rebuilding backend image..."
docker-compose -f docker-compose.cloudflare.yml build backend
print_status "✅ Rebuilt backend image"

# 3. Start backend container
print_status "Starting backend container..."
docker-compose -f docker-compose.cloudflare.yml up -d backend
print_status "✅ Started backend container"

# 4. Wait for backend to start
print_status "Waiting for backend to start..."
sleep 10

# 5. Check backend logs
print_status "Checking backend logs..."
docker-compose -f docker-compose.cloudflare.yml logs --tail=50 backend

# 6. Test health endpoint
print_status "Testing health endpoint..."
curl -s http://localhost/health | grep -q "status" && \
    print_status "✅ Backend health check passed" || \
    print_warning "⚠️ Backend health check failed"

print_header "🎉 Backend rebuild completed!"
print_status "Next steps:"
print_status "  1. Seed database: curl -X POST http://localhost/seed"
print_status "  2. Check API documentation: http://localhost/api"
print_status "  3. Monitor logs: docker-compose -f docker-compose.cloudflare.yml logs -f backend"
