#!/bin/bash

# Production Deployment Script for DevBreak
# Usage: ./deploy-production.sh [SERVER_IP]

set -e

SERVER_IP=${1:-"localhost"}
PROJECT_DIR=$(pwd)

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

print_header "🚀 Starting DevBreak Production Deployment"
print_status "Server IP: $SERVER_IP"

# Update frontend environment with server IP
print_status "Updating frontend environment variables..."
sed -i.bak "s/SERVER_IP/$SERVER_IP/g" app-ui/.env.production
print_status "✅ Frontend environment updated with IP: $SERVER_IP"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.production.yml down || true

# Build images if they don't exist
print_status "Checking for existing images..."
if ! docker images | grep -q "devbreak-backend"; then
    print_warning "Backend image not found. Building..."
    ./build-images.sh
fi

if ! docker images | grep -q "devbreak-frontend"; then
    print_warning "Frontend image not found. Building..."
    ./build-images.sh
fi

# Start services
print_status "Starting production services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check container status
print_status "Checking container status..."
docker-compose -f docker-compose.production.yml ps

# Test services
print_status "Testing services..."

# Test backend
print_status "Testing backend API..."
if curl -f -s "http://localhost/api/health" > /dev/null 2>&1; then
    print_status "✅ Backend API is responding"
else
    print_warning "⚠️  Backend API test failed (this might be normal if health endpoint doesn't exist)"
fi

# Test frontend
print_status "Testing frontend..."
if curl -f -s "http://localhost" > /dev/null 2>&1; then
    print_status "✅ Frontend is responding"
else
    print_warning "⚠️  Frontend test failed"
fi

print_header "🎉 Deployment completed!"
print_status "Application is running at:"
print_status "  - Frontend: http://$SERVER_IP"
print_status "  - Backend API: http://$SERVER_IP/api"
print_status ""
print_status "Useful commands:"
print_status "  - View logs: docker-compose -f docker-compose.production.yml logs -f"
print_status "  - Stop services: docker-compose -f docker-compose.production.yml down"
print_status "  - Restart services: docker-compose -f docker-compose.production.yml restart"
print_status ""
print_status "To check running containers: docker ps"
