# 🚀 Hướng dẫn Deploy DevBreak trên Ubuntu Server 24.04

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn deploy ứng dụng DevBreak (Frontend Next.js + Backend NestJS) trên Ubuntu Server 24.04 sử dụng Docker containers riêng biệt và Nginx reverse proxy.

## 🛠️ Chuẩn bị Server

### 1. Cài đặt Docker và Docker Compose

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

### 2. Clone Source Code

```bash
# Clone repository (nếu chưa có)
git clone <your-repo-url>
cd DevBreak

# Hoặc pull latest changes
git pull origin main
```

## 🔧 Cấu hình Environment

### 1. Cập nhật IP Server

Trước khi deploy, bạn cần cập nhật IP server trong file environment:

```bash
# Lấy IP hiện tại của server
ip addr show | grep inet

# Hoặc nếu dùng Tailscale
tailscale ip
```

### 2. Cập nhật Frontend Environment

Sửa file `app-ui/.env.production`:

```bash
nano app-ui/.env.production
```

Thay `SERVER_IP` bằng IP thực tế của server:

```env
# Thay YOUR_SERVER_IP bằng IP thực tế
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api
NEXT_PUBLIC_APP_NAME=DevBreak
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🚀 Deployment Options

### Option 1: Deploy với Docker Compose (Khuyến nghị)

```bash
# 1. Build images
chmod +x build-images.sh
./build-images.sh

# 2. Deploy với IP server
chmod +x deploy-production.sh
./deploy-production.sh YOUR_SERVER_IP

# Ví dụ:
./deploy-production.sh 192.168.1.100
# Hoặc với Tailscale IP:
./deploy-production.sh 100.64.1.2
```

### Option 2: Chạy containers riêng biệt

```bash
# 1. Build images trước
./build-images.sh

# 2. Chạy containers riêng biệt
chmod +x run-containers.sh
./run-containers.sh YOUR_SERVER_IP
```

### Option 3: Manual Docker Commands

```bash
# 1. Build images
cd app-server
docker build -t devbreak-backend:latest .

cd ../app-ui
docker build -t devbreak-frontend:latest .

cd ..

# 2. Create network
docker network create devbreak-network

# 3. Run PostgreSQL
docker run -d \
  --name devbreak_postgres \
  --network devbreak-network \
  -e POSTGRES_DB=user_management \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

# 4. Run Redis tạm thời không dùng 
# docker run -d \
#   --name devbreak_redis \
#   --network devbreak-network \
#   -v redis_data:/data \
#   redis:7-alpine

# 5. Run Backend
docker run -d \
  --name devbreak_backend \
  --network devbreak-network \
  -e NODE_ENV=production \
  -e DB_HOST=devbreak_postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=admin \
  -e DB_PASSWORD=password \
  -e DB_DATABASE=user_management \
  -e REDIS_HOST=devbreak_redis \
  -e REDIS_PORT=6379 \
  devbreak-backend:latest

# 6. Run Frontend
docker run -d \
  --name devbreak_frontend \
  --network devbreak-network \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api \
  devbreak-frontend:latest

# 7. Run Nginx
docker run -d \
  --name devbreak_nginx \
  --network devbreak-network \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx/nginx.production.conf:/etc/nginx/nginx.conf \
  nginx:alpine
```

## ✅ Kiểm tra Deployment

### 1. Kiểm tra containers

```bash
# Xem tất cả containers đang chạy
docker ps

# Kiểm tra logs
docker logs devbreak_backend
docker logs devbreak_frontend
docker logs devbreak_nginx
```

### 2. Test ứng dụng

```bash
# Test frontend
curl http://YOUR_SERVER_IP

# Test backend API
curl http://YOUR_SERVER_IP/api

# Test từ máy khác (nếu có)
curl http://YOUR_SERVER_IP
```

### 3. Kiểm tra trong browser

Mở browser và truy cập:
- `http://YOUR_SERVER_IP` - Frontend
- `http://YOUR_SERVER_IP/api` - Backend API

## 🌐 Public Access với Cloudflare Tunnel (devtri.xyz)

### Option A: Deploy với Cloudflare (Khuyến nghị cho production)

```bash
# 1. Setup Cloudflare Tunnel (chỉ cần chạy 1 lần)
chmod +x setup-cloudflare.sh
./setup-cloudflare.sh

# 2. Deploy application với Cloudflare
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

### Option B: Manual Cloudflare Setup

#### 1. Cài đặt cloudflared (nếu chưa có)

```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate (đã làm rồi)
cloudflared tunnel login
```

#### 2. Tạo tunnel

```bash
# Create tunnel
cloudflared tunnel create devbreak-tunnel

# List tunnels to get ID
cloudflared tunnel list
```

#### 3. Cấu hình tunnel

Tạo file `~/.cloudflared/config.yml`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/devtrantrongtri/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: devtri.xyz
    service: http://localhost:80
  - hostname: api.devtri.xyz
    service: http://localhost:80
  - service: http_status:404
```

#### 4. Tạo DNS records

```bash
# Create DNS records
cloudflared tunnel route dns YOUR_TUNNEL_ID devtri.xyz
cloudflared tunnel route dns YOUR_TUNNEL_ID api.devtri.xyz
```

#### 5. Chạy tunnel như service

```bash
# Create systemd service
sudo tee /etc/systemd/system/cloudflared.service > /dev/null << EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=devtrantrongtri
ExecStart=/usr/local/bin/cloudflared tunnel run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 🔧 Maintenance Commands

### Restart Services

```bash
# Restart tất cả
docker restart devbreak_postgres devbreak_redis devbreak_backend devbreak_frontend devbreak_nginx

# Restart từng service
docker restart devbreak_backend
docker restart devbreak_frontend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
./build-images.sh

# Redeploy
./deploy-production.sh YOUR_SERVER_IP
```

### Backup Database

```bash
# Backup
docker exec devbreak_postgres pg_dump -U admin user_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker exec -i devbreak_postgres psql -U admin user_management < backup.sql
```

### View Logs

```bash
# Real-time logs
docker logs -f devbreak_backend
docker logs -f devbreak_frontend
docker logs -f devbreak_nginx

# All logs
docker-compose -f docker-compose.production.yml logs -f
```

### Stop Services

```bash
# Stop all containers
docker stop devbreak_postgres devbreak_redis devbreak_backend devbreak_frontend devbreak_nginx

# Remove all containers
docker rm devbreak_postgres devbreak_redis devbreak_backend devbreak_frontend devbreak_nginx

# Hoặc dùng docker-compose
docker-compose -f docker-compose.production.yml down
```

## 🛡️ Security & Performance

### 1. Firewall Configuration

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

### 2. SSL với Let's Encrypt (Optional)

```bash
# Install certbot
sudo apt install certbot nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Monitoring

```bash
# Install monitoring tools
sudo apt install htop

# Monitor containers
docker stats

# Check disk usage
df -h
du -sh /var/lib/docker/
```

## 🚨 Troubleshooting

### Common Issues

1. **Container không start được:**
   ```bash
   docker logs [container_name]
   ```

2. **Port đã được sử dụng:**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo fuser -k 80/tcp
   ```

3. **Database connection failed:**
   ```bash
   docker exec -it devbreak_postgres psql -U admin -d user_management
   ```

4. **Frontend không kết nối được API:**
   - Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.production`
   - Đảm bảo IP server đúng

### Logs Location

- Backend logs: `docker logs devbreak_backend`
- Frontend logs: `docker logs devbreak_frontend`
- Nginx logs: `docker logs devbreak_nginx`
- Database logs: `docker logs devbreak_postgres`

## 📞 Support

Nếu gặp vấn đề trong quá trình deployment, hãy kiểm tra:

1. Docker containers status: `docker ps -a`
2. Network connectivity: `docker network ls`
3. Logs của từng service
4. Firewall settings
5. Environment variables

---

**Chúc bạn deploy thành công! 🎉**
