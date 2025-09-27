#!/bin/bash

# Fix Backend Build Script for DevBreak
# Usage: ./fix-backend-build.sh

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

print_header "🔧 Fixing Backend Build Issues for DevBreak"

# 1. Fix app.controller.ts
if [ -f "app-server/src/app.controller.ts" ]; then
    print_status "Fixing app.controller.ts..."
    
    # Create backup
    cp app-server/src/app.controller.ts app-server/src/app.controller.ts.bak
    
    # Fix duplicate import
    cat > app-server/src/app.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
EOF
    
    print_status "✅ Fixed app.controller.ts"
else
    print_warning "⚠️ app-server/src/app.controller.ts not found"
fi

# 2. Create .env.production for backend
print_status "Creating .env.production for backend..."
cat > app-server/src/.env.production << 'EOF'
# Database Configuration (for Docker)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=password
DB_DATABASE=user_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=production

# Cache Configuration (Redis - optional)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
EOF

print_status "✅ Created .env.production"

# 3. Fix Docker Compose file
if [ -f "docker-compose.cloudflare.yml" ]; then
    print_status "Fixing docker-compose.cloudflare.yml..."
    
    # Create backup
    cp docker-compose.cloudflare.yml docker-compose.cloudflare.yml.bak
    
    # Fix environment variables format
    cat > docker-compose.cloudflare.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: devbreak_postgres
    environment:
      POSTGRES_DB: user_management
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d user_management"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build:
      context: ./app-server
      dockerfile: Dockerfile
    image: devbreak-backend:latest
    container_name: devbreak_backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=admin
      - DB_PASSWORD=password
      - DB_DATABASE=user_management
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  frontend:
    build:
      context: ./app-ui
      dockerfile: Dockerfile
    image: devbreak-frontend:latest
    container_name: devbreak_frontend
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.devtri.xyz
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: devbreak_nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.cloudflare.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
EOF
    
    print_status "✅ Fixed docker-compose.cloudflare.yml"
else
    print_warning "⚠️ docker-compose.cloudflare.yml not found"
fi

# 4. Fix backend Dockerfile
if [ -f "app-server/Dockerfile" ]; then
    print_status "Fixing app-server/Dockerfile..."
    
    # Create backup
    cp app-server/Dockerfile app-server/Dockerfile.bak
    
    # Create new Dockerfile
    cat > app-server/Dockerfile << 'EOF'
# Multi-stage build cho NestJS
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Copy .env.production to .env
COPY src/.env.production .env

# Build application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy node_modules and other files
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/.env ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER nestjs

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

# Expose port
EXPOSE 3000
EOF
    
    print_status "✅ Fixed app-server/Dockerfile"
else
    print_warning "⚠️ app-server/Dockerfile not found"
fi

# 5. Clean Docker environment
print_status "Cleaning Docker environment..."
docker-compose -f docker-compose.cloudflare.yml down
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker rmi devbreak-backend:latest devbreak-frontend:latest 2>/dev/null || true
print_status "✅ Cleaned Docker environment"

# 6. Rebuild and restart
print_status "Rebuilding and restarting containers..."
docker-compose -f docker-compose.cloudflare.yml up -d --build
print_status "✅ Rebuilt and restarted containers"

# 7. Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# 8. Check container status
print_status "Checking container status..."
docker ps

print_header "🎉 Backend build fix completed!"
print_status "Next steps:"
print_status "  1. Check backend logs: docker logs devbreak_backend"
print_status "  2. Test API: curl http://localhost/health"
print_status "  3. Restart Cloudflare tunnel: sudo systemctl restart cloudflared"
