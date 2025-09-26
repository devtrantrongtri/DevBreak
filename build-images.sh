#!/bin/bash

# Build Docker Images for Production
# Usage: ./build-images.sh

set -e

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
    echo -e "${BLUE}[BUILD]${NC} $1"
}

PROJECT_DIR=$(pwd)

print_header "🚀 Building DevBreak Docker Images"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_status "Building Backend (NestJS) Image..."
cd $PROJECT_DIR/app-server
docker build -t devbreak-backend:latest .
if [ $? -eq 0 ]; then
    print_status "✅ Backend image built successfully"
else
    print_error "❌ Failed to build backend image"
    exit 1
fi

print_status "Building Frontend (Next.js) Image..."
cd $PROJECT_DIR/app-ui
docker build -t devbreak-frontend:latest .
if [ $? -eq 0 ]; then
    print_status "✅ Frontend image built successfully"
else
    print_error "❌ Failed to build frontend image"
    exit 1
fi

cd $PROJECT_DIR

print_status "📋 Listing built images:"
docker images | grep devbreak

print_header "🎉 All images built successfully!"
print_status "You can now run: ./deploy-production.sh to start the application"
