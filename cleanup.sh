#!/bin/bash

# Cleanup Script for DevBreak
# Usage: ./cleanup.sh [--force]

FORCE_MODE=false
if [ "$1" = "--force" ]; then
    FORCE_MODE=true
fi

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
    echo -e "${BLUE}[CLEANUP]${NC} $1"
}

confirm_action() {
    if [ "$FORCE_MODE" = true ]; then
        return 0
    fi
    
    echo -n "Are you sure? (y/N): "
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

print_header "🧹 DevBreak Cleanup Script"

if [ "$FORCE_MODE" = true ]; then
    print_warning "Running in FORCE mode - no confirmations will be asked"
fi

echo ""
print_header "This script will:"
echo "  1. Stop all DevBreak containers"
echo "  2. Remove all DevBreak containers"
echo "  3. Remove DevBreak images (optional)"
echo "  4. Remove DevBreak volumes (optional - THIS WILL DELETE DATA!)"
echo "  5. Remove DevBreak networks"
echo ""

if ! confirm_action; then
    print_status "Cleanup cancelled"
    exit 0
fi

# Stop containers
print_status "Stopping DevBreak containers..."
containers=("devbreak_postgres" "devbreak_redis" "devbreak_backend" "devbreak_frontend" "devbreak_nginx")

for container in "${containers[@]}"; do
    if docker ps -q --filter "name=$container" | grep -q .; then
        print_status "Stopping $container..."
        docker stop $container
    else
        print_warning "$container is not running"
    fi
done

# Remove containers
print_status "Removing DevBreak containers..."
for container in "${containers[@]}"; do
    if docker ps -aq --filter "name=$container" | grep -q .; then
        print_status "Removing $container..."
        docker rm $container
    else
        print_warning "$container does not exist"
    fi
done

# Ask about images
echo ""
print_warning "Do you want to remove DevBreak images? (This will require rebuilding)"
if confirm_action; then
    print_status "Removing DevBreak images..."
    
    if docker images -q devbreak-backend:latest | grep -q .; then
        docker rmi devbreak-backend:latest
        print_status "Removed devbreak-backend image"
    fi
    
    if docker images -q devbreak-frontend:latest | grep -q .; then
        docker rmi devbreak-frontend:latest
        print_status "Removed devbreak-frontend image"
    fi
else
    print_status "Keeping DevBreak images"
fi

# Ask about volumes
echo ""
print_error "⚠️  DANGER: Do you want to remove DevBreak volumes?"
print_error "This will PERMANENTLY DELETE all database data!"
if confirm_action; then
    print_status "Removing DevBreak volumes..."
    
    volumes=("postgres_data" "redis_data")
    for volume in "${volumes[@]}"; do
        if docker volume ls -q --filter "name=$volume" | grep -q .; then
            docker volume rm $volume
            print_status "Removed $volume volume"
        else
            print_warning "$volume volume does not exist"
        fi
    done
else
    print_status "Keeping DevBreak volumes (data preserved)"
fi

# Remove networks
print_status "Removing DevBreak networks..."
networks=("devbreak-network" "devbreak_app-network")
for network in "${networks[@]}"; do
    if docker network ls -q --filter "name=$network" | grep -q .; then
        docker network rm $network 2>/dev/null || print_warning "Could not remove $network (may be in use)"
    fi
done

# Clean up unused Docker resources
echo ""
print_status "Do you want to clean up unused Docker resources?"
if confirm_action; then
    print_status "Cleaning up unused Docker resources..."
    docker system prune -f
    print_status "Docker cleanup completed"
fi

# Final check
echo ""
print_header "📊 Cleanup Summary"
echo "========================================"

remaining_containers=$(docker ps -aq --filter "name=devbreak" | wc -l)
if [ $remaining_containers -eq 0 ]; then
    print_status "✅ All DevBreak containers removed"
else
    print_warning "⚠️  $remaining_containers DevBreak containers still exist"
fi

remaining_images=$(docker images -q | xargs docker inspect --format='{{.RepoTags}}' 2>/dev/null | grep -c "devbreak" || echo "0")
if [ $remaining_images -eq 0 ]; then
    print_status "✅ All DevBreak images removed"
else
    print_warning "⚠️  $remaining_images DevBreak images still exist"
fi

remaining_volumes=$(docker volume ls -q --filter "name=postgres_data\|redis_data" | wc -l)
if [ $remaining_volumes -eq 0 ]; then
    print_status "✅ All DevBreak volumes removed"
else
    print_warning "⚠️  $remaining_volumes DevBreak volumes still exist"
fi

echo ""
print_header "🎉 Cleanup completed!"
print_status "To redeploy DevBreak, run: ./deploy-production.sh [SERVER_IP]"
