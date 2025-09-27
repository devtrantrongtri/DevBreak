#!/bin/bash

# Fix Ports Configuration Script for DevBreak
# Usage: ./fix-ports.sh

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

print_header "🔧 Fixing Ports Configuration for DevBreak"

# 1. Check current port configuration
print_status "Checking current port configuration..."
docker ps --format "{{.Names}}: {{.Ports}}"

# 2. Stop all containers
print_status "Stopping all containers..."
docker-compose -f docker-compose.cloudflare.yml down
print_status "✅ Stopped all containers"

# 3. Update main.ts to use port 3000
if [ -f "app-server/src/main.ts" ]; then
    print_status "Updating backend port in main.ts..."
    sed -i 's/await app.listen(3001);/await app.listen(3000);/g' app-server/src/main.ts
    sed -i 's/console.log(`🚀 Application is running on: http:\/\/localhost:3001`);/console.log(`🚀 Application is running on: http:\/\/localhost:3000`);/g' app-server/src/main.ts
    sed -i 's/console.log(`📚 Swagger documentation: http:\/\/localhost:3001\/api`);/console.log(`📚 Swagger documentation: http:\/\/localhost:3000\/api`);/g' app-server/src/main.ts
    print_status "✅ Updated backend port in main.ts"
else
    print_warning "⚠️ app-server/src/main.ts not found"
fi

# 4. Update Nginx configuration
print_status "Updating Nginx configuration..."
sed -i 's/proxy_pass http:\/\/backend:3001;/proxy_pass http:\/\/backend:3000;/g' nginx/nginx.cloudflare.conf
print_status "✅ Updated Nginx configuration"

# 5. Add CORS configuration
print_status "Adding CORS configuration to main.ts..."
if grep -q "app.enableCors" app-server/src/main.ts; then
    print_status "CORS configuration already exists"
else
    # Backup main.ts
    cp app-server/src/main.ts app-server/src/main.ts.bak
    
    # Add CORS configuration after app creation
    awk '
    /const app = await NestFactory.create\(AppModule\);/ {
        print;
        print "  ";
        print "  // CORS configuration";
        print "  app.enableCors({";
        print "    origin: [";
        print "      '\''https://devtri.xyz'\'',"
        print "      '\''http://localhost:3000'\'',"
        print "      '\''http://localhost'\'',"
        print "      /\\.devtri\\.xyz$/ // Allow all subdomains";
        print "    ],";
        print "    methods: ['\''GET'\'', '\''POST'\'', '\''PUT'\'', '\''DELETE'\'', '\''PATCH'\'', '\''OPTIONS'\''],";
        print "    credentials: true,";
        print "    allowedHeaders: ['\''Content-Type'\'', '\''Authorization'\'', '\''X-Requested-With'\'']";
        print "  });";
        next;
    }
    { print }
    ' app-server/src/main.ts > app-server/src/main.ts.new
    
    mv app-server/src/main.ts.new app-server/src/main.ts
    print_status "✅ Added CORS configuration to main.ts"
fi

# 6. Clean Docker images
print_status "Cleaning Docker images..."
docker rmi devbreak-backend:latest devbreak-frontend:latest 2>/dev/null || true
print_status "✅ Cleaned Docker images"

# 7. Rebuild and start containers
print_status "Rebuilding and starting containers..."
docker-compose -f docker-compose.cloudflare.yml up -d --build
print_status "✅ Rebuilt and started containers"

# 8. Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# 9. Check container status
print_status "Checking container status..."
docker ps --format "{{.Names}}: {{.Ports}}"

# 10. Test services
print_status "Testing services..."
curl -s http://localhost | grep -q "title" && print_status "✅ Frontend is responding" || print_warning "⚠️ Frontend test failed"
curl -s http://localhost/api/health | grep -q "healthy" && print_status "✅ Backend is responding" || print_warning "⚠️ Backend test failed"

print_header "🎉 Port configuration fix completed!"
print_status "Configuration summary:"
print_status "  - Frontend: https://devtri.xyz (port 3000)"
print_status "  - Backend API: https://api.devtri.xyz (port 3000)"
print_status "  - CORS: Configured to allow cross-origin requests"
print_status ""
print_status "Next steps:"
print_status "  1. Restart Cloudflare tunnel: sudo systemctl restart cloudflared"
print_status "  2. Test: curl https://api.devtri.xyz/health"
print_status "  3. Test: curl https://devtri.xyz"
