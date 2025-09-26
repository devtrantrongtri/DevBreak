#!/bin/bash

# Run individual Docker containers for DevBreak
# Usage: ./run-containers.sh [SERVER_IP]

set -e

SERVER_IP=${1:-"localhost"}

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
    echo -e "${BLUE}[RUN]${NC} $1"
}

print_header "🚀 Running DevBreak Containers Individually"

# Create network if it doesn't exist
print_status "Creating Docker network..."
docker network create devbreak-network || print_warning "Network already exists"

# Stop and remove existing containers
print_status "Cleaning up existing containers..."
docker stop devbreak_postgres devbreak_redis devbreak_backend devbreak_frontend devbreak_nginx 2>/dev/null || true
docker rm devbreak_postgres devbreak_redis devbreak_backend devbreak_frontend devbreak_nginx 2>/dev/null || true

# Run PostgreSQL
print_status "Starting PostgreSQL..."
docker run -d \
  --name devbreak_postgres \
  --network devbreak-network \
  -e POSTGRES_DB=user_management \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

# Run Redis
print_status "Starting Redis..."
docker run -d \
  --name devbreak_redis \
  --network devbreak-network \
  -v redis_data:/data \
  redis:7-alpine

# Wait for databases
print_status "Waiting for databases to be ready..."
sleep 15

# Run Backend
print_status "Starting Backend..."
docker run -d \
  --name devbreak_backend \
  --network devbreak-network \
  -e NODE_ENV=production \
  -e DB_HOST=devbreak_postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=admin \
  -e DB_PASSWORD=password \
  -e DB_DATABASE=user_management \
  -e REDIS_HOST=devbreak_redis \
  -e REDIS_PORT=6379 \
  devbreak-backend:latest

# Wait for backend
print_status "Waiting for backend to be ready..."
sleep 10

# Run Frontend
print_status "Starting Frontend..."
docker run -d \
  --name devbreak_frontend \
  --network devbreak-network \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://$SERVER_IP/api \
  devbreak-frontend:latest

# Wait for frontend
print_status "Waiting for frontend to be ready..."
sleep 10

# Run Nginx
print_status "Starting Nginx..."
docker run -d \
  --name devbreak_nginx \
  --network devbreak-network \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx/nginx.production.conf:/etc/nginx/nginx.conf \
  nginx:alpine

print_status "Waiting for all services to be ready..."
sleep 10

# Check status
print_header "📋 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

print_header "🎉 All containers are running!"
print_status "Application is available at:"
print_status "  - Frontend: http://$SERVER_IP"
print_status "  - Backend API: http://$SERVER_IP/api"
print_status ""
print_status "Useful commands:"
print_status "  - View logs: docker logs -f [container_name]"
print_status "  - Stop all: docker stop devbreak_postgres devbreak_redis devbreak_backend devbreak_frontend devbreak_nginx"
print_status "  - Remove all: docker rm devbreak_postgres devbreak_redis devbreak_backend devbreak_frontend devbreak_nginx"
