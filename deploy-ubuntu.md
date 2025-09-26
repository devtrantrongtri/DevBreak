# Hướng dẫn Deploy lên Ubuntu Server

## 1. Chuẩn bị Ubuntu Server

### Cài đặt Docker và Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Cài đặt Nginx (nếu cần SSL)
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

## 2. Upload Code lên Server

### Sử dụng Git (Khuyến nghị)
```bash
# Clone repository
git clone <your-repo-url>
cd <your-project-name>

# Hoặc nếu đã có code
rsync -avz --exclude 'node_modules' ./ user@server:/path/to/project/
```

### Sử dụng SCP
```bash
# From local machine
scp -r ./project-folder user@server-ip:/home/user/
```

## 3. Cấu hình Environment Variables

### Tạo file .env cho production
```bash
# Tạo file .env trong root project
cat > .env << EOF
NODE_ENV=production
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=user_management
DATABASE_USER=admin
DATABASE_PASSWORD=your_secure_password_here
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=http://your-domain.com/api
EOF
```

## 4. Build và Deploy với Docker

### Build images
```bash
# Build tất cả services
docker-compose build

# Hoặc build từng service
docker-compose build app-server
docker-compose build app-ui
```

### Deploy
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Check running containers
docker-compose ps
```

## 5. Cấu hình Nginx cho Public Access

### Tạo Nginx config cho domain
```bash
sudo nano /etc/nginx/sites-available/your-domain.com
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable site và restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Cài đặt SSL với Let's Encrypt

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 7. Monitoring và Maintenance

### Useful commands
```bash
# View logs
docker-compose logs -f app-server
docker-compose logs -f app-ui

# Restart services
docker-compose restart app-server
docker-compose restart app-ui

# Update application
git pull
docker-compose build
docker-compose up -d

# Backup database
docker exec devbreak_postgres pg_dump -U admin user_management > backup.sql

# Restore database
docker exec -i devbreak_postgres psql -U admin user_management < backup.sql
```

### System monitoring
```bash
# Install htop for monitoring
sudo apt install htop

# Monitor Docker containers
docker stats

# Check disk usage
df -h
du -sh /var/lib/docker/
```

## 8. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

## 9. Auto-start on Boot

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Create systemd service for auto-restart
sudo nano /etc/systemd/system/devbreak-app.service
```

```ini
[Unit]
Description=DevBreak Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/your/project
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable devbreak-app.service
sudo systemctl start devbreak-app.service
```

## 10. Performance Optimization Tips

### Tối ưu Docker
- Sử dụng multi-stage builds (đã có trong Dockerfile)
- Limit memory và CPU cho containers
- Sử dụng Docker volumes cho persistent data

### Tối ưu Next.js
- Enable compression trong nginx
- Sử dụng CDN cho static assets
- Optimize images với next/image

### Database optimization
- Regular backup và cleanup
- Monitor query performance
- Use connection pooling
