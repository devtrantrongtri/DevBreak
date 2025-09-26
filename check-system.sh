#!/bin/bash

# System Health Check Script for DevBreak
# Usage: ./check-system.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_header "🔍 DevBreak System Health Check"
echo "========================================"

# Check Docker
print_header "Checking Docker..."
if command -v docker &> /dev/null; then
    print_status "Docker is installed: $(docker --version)"
    if docker info &> /dev/null; then
        print_status "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
    fi
else
    print_error "Docker is not installed"
fi

# Check Docker Compose
print_header "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    print_status "Docker Compose is installed: $(docker-compose --version)"
else
    print_error "Docker Compose is not installed"
fi

# Check containers
print_header "Checking DevBreak Containers..."
containers=("devbreak_postgres" "devbreak_redis" "devbreak_backend" "devbreak_frontend" "devbreak_nginx")

for container in "${containers[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        status=$(docker inspect --format='{{.State.Status}}' $container)
        if [ "$status" = "running" ]; then
            print_status "$container is running"
        else
            print_warning "$container exists but not running (status: $status)"
        fi
    else
        print_warning "$container is not running"
    fi
done

# Check images
print_header "Checking DevBreak Images..."
if docker images | grep -q "devbreak-backend"; then
    print_status "Backend image exists"
else
    print_warning "Backend image not found"
fi

if docker images | grep -q "devbreak-frontend"; then
    print_status "Frontend image exists"
else
    print_warning "Frontend image not found"
fi

# Check network
print_header "Checking Docker Networks..."
if docker network ls | grep -q "devbreak-network\|app-network"; then
    print_status "DevBreak network exists"
else
    print_warning "DevBreak network not found"
fi

# Check ports
print_header "Checking Port Usage..."
if netstat -tuln 2>/dev/null | grep -q ":80 "; then
    print_status "Port 80 is in use"
else
    print_warning "Port 80 is not in use"
fi

if netstat -tuln 2>/dev/null | grep -q ":443 "; then
    print_status "Port 443 is in use"
else
    print_warning "Port 443 is not in use"
fi

# Test connectivity
print_header "Testing Application Connectivity..."
if curl -f -s "http://localhost" > /dev/null 2>&1; then
    print_status "Frontend is accessible on http://localhost"
else
    print_warning "Frontend is not accessible on http://localhost"
fi

if curl -f -s "http://localhost/api" > /dev/null 2>&1; then
    print_status "Backend API is accessible on http://localhost/api"
else
    print_warning "Backend API is not accessible on http://localhost/api"
fi

# Check disk space
print_header "Checking Disk Space..."
df_output=$(df -h / | tail -1)
used_percent=$(echo $df_output | awk '{print $5}' | sed 's/%//')
if [ $used_percent -lt 80 ]; then
    print_status "Disk usage: ${used_percent}% (OK)"
elif [ $used_percent -lt 90 ]; then
    print_warning "Disk usage: ${used_percent}% (Warning)"
else
    print_error "Disk usage: ${used_percent}% (Critical)"
fi

# Check memory
print_header "Checking Memory Usage..."
if command -v free &> /dev/null; then
    memory_info=$(free -h | grep "Mem:")
    print_status "Memory: $memory_info"
fi

# Check Docker volumes
print_header "Checking Docker Volumes..."
if docker volume ls | grep -q "postgres_data"; then
    print_status "PostgreSQL data volume exists"
else
    print_warning "PostgreSQL data volume not found"
fi

if docker volume ls | grep -q "redis_data"; then
    print_status "Redis data volume exists"
else
    print_warning "Redis data volume not found"
fi

# Summary
echo ""
print_header "📊 System Summary"
echo "========================================"
running_containers=$(docker ps --format "{{.Names}}" | grep "devbreak" | wc -l)
total_containers=5

if [ $running_containers -eq $total_containers ]; then
    print_status "All $total_containers DevBreak containers are running"
elif [ $running_containers -gt 0 ]; then
    print_warning "$running_containers out of $total_containers containers are running"
else
    print_error "No DevBreak containers are running"
fi

echo ""
print_header "🛠️  Useful Commands:"
echo "  - View logs: docker logs -f [container_name]"
echo "  - Restart all: ./deploy-production.sh [SERVER_IP]"
echo "  - Stop all: docker stop \$(docker ps -q --filter name=devbreak)"
echo "  - Clean up: ./cleanup.sh"
