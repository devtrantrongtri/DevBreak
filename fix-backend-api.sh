#!/bin/bash

# Fix Backend API Script for DevBreak
# Usage: ./fix-backend-api.sh

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

print_header "🔧 Fixing Backend API for DevBreak"

# 1. Check backend logs
print_status "Checking backend logs..."
docker logs devbreak_backend

# 2. Create health check endpoint
if [ -f "app-server/src/app.controller.ts" ]; then
    print_status "Adding health check endpoint to app.controller.ts..."
    
    # Create backup
    cp app-server/src/app.controller.ts app-server/src/app.controller.ts.bak
    
    # Check if health endpoint already exists
    if grep -q "health()" app-server/src/app.controller.ts; then
        print_status "Health endpoint already exists"
    else
        # Add health endpoint to app.controller.ts
        awk '
        /import { Controller/ {
            if (!getline_called) {
                getline_called = 1;
                print;
                print "import { Get } from '\''@nestjs/common'\'';"
                next;
            }
        }
        /export class AppController/ {
            print;
            print "";
            print "  @Get('\''health'\'')"
            print "  health() {"
            print "    return { status: '\''ok'\'', timestamp: new Date().toISOString() };"
            print "  }"
            print ""
            next;
        }
        { print }
        ' app-server/src/app.controller.ts > app-server/src/app.controller.ts.new
        
        mv app-server/src/app.controller.ts.new app-server/src/app.controller.ts
        print_status "✅ Added health check endpoint to app.controller.ts"
    fi
else
    print_warning "⚠️ app-server/src/app.controller.ts not found"
    
    # Create a simple health controller
    print_status "Creating health.controller.ts..."
    mkdir -p app-server/src/health
    
    cat > app-server/src/health/health.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
EOF
    
    # Update app.module.ts to include the health controller
    if [ -f "app-server/src/app.module.ts" ]; then
        print_status "Updating app.module.ts to include HealthController..."
        
        # Create backup
        cp app-server/src/app.module.ts app-server/src/app.module.ts.bak
        
        # Add HealthController to app.module.ts
        awk '
        /import { Module }/ {
            print;
            print "import { HealthController } from '\''./health/health.controller'\'';"
            next;
        }
        /controllers: \[/ {
            if ($0 ~ /\]/) {
                gsub(/\]/, "HealthController]", $0);
            } else {
                gsub(/controllers: \[/, "controllers: [HealthController, ", $0);
            }
            print;
            next;
        }
        { print }
        ' app-server/src/app.module.ts > app-server/src/app.module.ts.new
        
        mv app-server/src/app.module.ts.new app-server/src/app.module.ts
        print_status "✅ Updated app.module.ts"
    else
        print_warning "⚠️ app-server/src/app.module.ts not found"
    fi
fi

# 3. Rebuild backend
print_status "Rebuilding backend..."
docker-compose -f docker-compose.cloudflare.yml build backend
print_status "✅ Rebuilt backend"

# 4. Restart backend
print_status "Restarting backend..."
docker-compose -f docker-compose.cloudflare.yml up -d backend
print_status "✅ Restarted backend"

# 5. Wait for backend to start
print_status "Waiting for backend to start..."
sleep 10

# 6. Test health endpoint
print_status "Testing health endpoint..."
if curl -s http://localhost/api/health | grep -q "status"; then
    print_status "✅ Health endpoint is working"
else
    print_warning "⚠️ Health endpoint test failed"
    print_status "Testing alternative health endpoint..."
    if curl -s http://localhost/health | grep -q "status"; then
        print_status "✅ Alternative health endpoint is working"
    else
        print_warning "⚠️ Alternative health endpoint test failed"
    fi
fi

print_header "🎉 Backend API fix completed!"
print_status "Next steps:"
print_status "  1. Restart Cloudflare tunnel: sudo systemctl restart cloudflared"
print_status "  2. Test API: curl https://api.devtri.xyz/health"
print_status "  3. Test API alternative: curl https://api.devtri.xyz/api/health"
