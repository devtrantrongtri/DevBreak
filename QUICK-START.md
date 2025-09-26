# 🚀 DevBreak - Quick Start Deployment

## 📁 Files Created

### Environment Files
- `app-server/.env.production` - Backend production environment
- `app-ui/.env.production` - Frontend production environment

### Docker Configuration
- `docker-compose.production.yml` - Production Docker Compose
- `nginx/nginx.production.conf` - Nginx configuration for production

### Deployment Scripts
- `build-images.sh` - Build Docker images
- `deploy-production.sh` - Full deployment script
- `run-containers.sh` - Run individual containers
- `update-server-ip.sh` - Update server IP easily

### Maintenance Scripts
- `check-system.sh` - System health check
- `cleanup.sh` - Clean up containers and images

### Documentation
- `DEPLOYMENT-GUIDE.md` - Detailed deployment guide
- `QUICK-START.md` - This file

## ⚡ Quick Deployment

### Option A: Deploy với Cloudflare (Khuyến nghị - devtri.xyz)

```bash
# 1. Chuẩn bị Server
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Tạo quyền thực thi
chmod +x *.sh

# 3. Setup Cloudflare (chỉ cần chạy 1 lần)
./setup-cloudflare.sh

# 4. Deploy với Cloudflare
./deploy-cloudflare.sh
```

### Option B: Deploy Local với IP (3 Steps)

```bash
# 1. Chuẩn bị Server
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Cập nhật IP Server
# Lấy IP server
ip addr show | grep inet

# Cập nhật IP trong environment
nano app-ui/.env.production
# Thay SERVER_IP bằng IP thực tế của server

# 3. Deploy
chmod +x *.sh
./build-images.sh
./deploy-production.sh YOUR_SERVER_IP
```

## 🔧 Useful Commands

```bash
# Kiểm tra hệ thống
./check-system.sh

# Xem containers đang chạy
docker ps

# Xem logs
docker logs -f devbreak_backend
docker logs -f devbreak_frontend

# Restart services
docker restart devbreak_backend devbreak_frontend

# Cập nhật IP server
./update-server-ip.sh NEW_IP

# Dọn dẹp hệ thống
./cleanup.sh
```

## 🌐 Access Application

### Với Cloudflare (Production):
- **Frontend**: `https://devtri.xyz`
- **Backend API**: `https://devtri.xyz/api`

### Với Local IP:
- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP/api`

## 🔗 Cloudflare Commands

```bash
# Kiểm tra tunnel status
sudo systemctl status cloudflared

# Xem tunnel logs
sudo journalctl -u cloudflared -f

# Restart tunnel
sudo systemctl restart cloudflared

# List tunnels
cloudflared tunnel list

# Test tunnel connectivity
cloudflared tunnel info devbreak-tunnel
```

## 📞 Troubleshooting

1. **Containers không start**: `docker logs [container_name]`
2. **Port conflicts**: `sudo netstat -tulpn | grep :80`
3. **API không kết nối**: Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.production`
4. **Database issues**: `docker exec -it devbreak_postgres psql -U admin -d user_management`

---

**Happy Coding! 🎉**
