#!/bin/bash

# Production Deploy Script for Ubuntu Server
# Usage: ./production-deploy.sh [domain-name]

set -e

DOMAIN=${1:-localhost}
PROJECT_DIR=$(pwd)

echo "🚀 Starting production deployment for domain: $DOMAIN"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed ✓"
}

# Create production environment file
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating production .env file..."
        cat > .env << EOF
NODE_ENV=production
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=user_management
DATABASE_USER=admin
DATABASE_PASSWORD=$(openssl rand -base64 32)
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=$(openssl rand -base64 64)
NEXT_PUBLIC_API_URL=http://$DOMAIN/api
EOF
        print_status "Created .env file with secure passwords"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose down || true
}

# Build and start containers
build_and_start() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    print_status "Starting containers..."
    docker-compose up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_status "All containers are running ✓"
    else
        print_error "Some containers failed to start"
        docker-compose logs
        exit 1
    fi
}

# Setup Nginx configuration
setup_nginx() {
    if command -v nginx &> /dev/null; then
        print_status "Setting up Nginx configuration..."
        
        # Create Nginx config
        sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    client_max_body_size 100M;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
        
        # Test and reload Nginx
        if sudo nginx -t; then
            sudo systemctl reload nginx
            print_status "Nginx configuration updated ✓"
        else
            print_error "Nginx configuration test failed"
            exit 1
        fi
    else
        print_warning "Nginx not installed, skipping Nginx setup"
    fi
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    if command -v certbot &> /dev/null && [ "$DOMAIN" != "localhost" ]; then
        print_status "Setting up SSL certificate..."
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        print_status "SSL certificate installed ✓"
    else
        print_warning "Certbot not installed or domain is localhost, skipping SSL setup"
    fi
}

# Setup firewall
setup_firewall() {
    if command -v ufw &> /dev/null; then
        print_status "Configuring firewall..."
        sudo ufw --force enable
        sudo ufw allow ssh
        sudo ufw allow 80
        sudo ufw allow 443
        print_status "Firewall configured ✓"
    else
        print_warning "UFW not installed, skipping firewall setup"
    fi
}

# Create systemd service for auto-start
create_systemd_service() {
    print_status "Creating systemd service..."
    sudo tee /etc/systemd/system/devbreak-app.service > /dev/null << EOF
[Unit]
Description=DevBreak Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable devbreak-app.service
    print_status "Systemd service created and enabled ✓"
}

# Main deployment process
main() {
    print_status "Starting deployment process..."
    
    check_docker
    create_env_file
    stop_containers
    build_and_start
    setup_nginx
    setup_ssl
    setup_firewall
    create_systemd_service
    
    print_status "🎉 Deployment completed successfully!"
    print_status "Your application is now running at: http://$DOMAIN"
    
    if [ "$DOMAIN" != "localhost" ]; then
        print_status "HTTPS: https://$DOMAIN"
    fi
    
    print_status "To view logs: docker-compose logs -f"
    print_status "To restart: docker-compose restart"
}

# Run main function
main
