#!/bin/bash

# Fix Build Script for DevBreak
# Usage: ./fix-build.sh

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

print_header "🔧 Fixing NestJS Build Issues"

# Check if we're in the right directory
if [ ! -f "app-server/Dockerfile" ]; then
    print_error "Please run this script from the root of the DevBreak project"
    exit 1
fi

# Fix app-server Dockerfile
print_status "Fixing app-server Dockerfile..."
cat > app-server/Dockerfile << 'EOF'
# Multi-stage build cho NestJS
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application and node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
EOF

print_status "✅ Fixed app-server Dockerfile"

# Check if package.json has build script
if ! grep -q '"build"' app-server/package.json; then
    print_warning "Adding build script to package.json..."
    
    # Use sed to add build script if not present
    sed -i 's/"scripts": {/"scripts": {\n    "build": "nest build",/' app-server/package.json
    
    print_status "✅ Added build script to package.json"
fi

# Clean up Docker
print_status "Cleaning up Docker images..."
docker rmi devbreak-backend:latest 2>/dev/null || true

print_status "✅ Cleaned up Docker images"

print_header "🎉 Build fix completed!"
print_status "You can now run: ./deploy-cloudflare.sh"
