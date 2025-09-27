#!/bin/bash

# Fix Dockerfile ENV Format Script for DevBreak
# Usage: ./fix-dockerfile.sh

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

print_header "🔧 Fixing Dockerfile ENV Format for DevBreak"

# 1. Fix Frontend Dockerfile
if [ -f "app-ui/Dockerfile" ]; then
    print_status "Fixing ENV format in app-ui/Dockerfile..."
    
    # Create backup
    cp app-ui/Dockerfile app-ui/Dockerfile.bak
    
    # Fix ENV format
    sed -i 's/ENV NEXT_TELEMETRY_DISABLED 1/ENV NEXT_TELEMETRY_DISABLED=1/g' app-ui/Dockerfile
    sed -i 's/ENV NODE_ENV production/ENV NODE_ENV=production/g' app-ui/Dockerfile
    sed -i 's/ENV PORT 3000/ENV PORT=3000/g' app-ui/Dockerfile
    sed -i 's/ENV HOSTNAME "0.0.0.0"/ENV HOSTNAME="0.0.0.0"/g' app-ui/Dockerfile
    
    print_status "✅ Fixed ENV format in app-ui/Dockerfile"
else
    print_warning "⚠️ app-ui/Dockerfile not found"
fi

# 2. Fix Backend Dockerfile (if needed)
if [ -f "app-server/Dockerfile" ]; then
    print_status "Checking app-server/Dockerfile for ENV format issues..."
    
    # Check if there are ENV format issues
    if grep -q "ENV .* " app-server/Dockerfile; then
        # Create backup
        cp app-server/Dockerfile app-server/Dockerfile.bak
        
        # Fix ENV format using awk for more complex replacements
        awk '{
            if ($1 == "ENV" && NF >= 3) {
                key = $2;
                value = "";
                for (i=3; i<=NF; i++) {
                    if (value == "") {
                        value = $i;
                    } else {
                        value = value " " $i;
                    }
                }
                print "ENV " key "=" value;
            } else {
                print $0;
            }
        }' app-server/Dockerfile > app-server/Dockerfile.new
        
        mv app-server/Dockerfile.new app-server/Dockerfile
        print_status "✅ Fixed ENV format in app-server/Dockerfile"
    else
        print_status "No ENV format issues found in app-server/Dockerfile"
    fi
else
    print_warning "⚠️ app-server/Dockerfile not found"
fi

# 3. Rebuild images
print_status "Rebuilding Docker images..."
docker-compose -f docker-compose.cloudflare.yml build
print_status "✅ Rebuilt Docker images"

# 4. Restart containers
print_status "Restarting containers..."
docker-compose -f docker-compose.cloudflare.yml up -d
print_status "✅ Restarted containers"

print_header "🎉 Dockerfile ENV format fix completed!"
print_status "Next steps:"
print_status "  1. Check backend logs: docker logs devbreak_backend"
print_status "  2. Test API: curl http://localhost/api/health"
