#!/bin/bash

# Cleanup Old Scripts for DevBreak
# Usage: ./cleanup-old-scripts.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[CLEANUP]${NC} $1"
}

print_header "🧹 Cleaning up old deployment scripts"

# List of old scripts to remove
OLD_SCRIPTS=(
    "fix-https-config.sh"
    "fix-cors.sh" 
    "fix-ports.sh"
    "fix-dockerfile.sh"
    "fix-backend-api.sh"
    "fix-backend-build.sh"
)

# Remove old scripts
for script in "${OLD_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        print_status "Removing $script..."
        rm "$script"
    fi
done

# Remove backup files
print_status "Removing backup files..."
find . -name "*.bak" -type f -delete 2>/dev/null || true

print_status "✅ Cleanup completed!"
print_status "Remaining deployment scripts:"
print_status "  - deploy.sh (main deployment script)"
print_status "  - README.md (deployment guide)"
