# DevBreak - Production Deployment Guide

DevBreak là một ứng dụng full-stack quản lý người dùng với hệ thống RBAC (Role-Based Access Control) phức tạp.

## 🏗️ Kiến trúc hệ thống

### Tech Stack
- **Backend**: NestJS + TypeORM + PostgreSQL + Redis
- **Frontend**: Next.js + React + TypeScript + Ant Design  
- **Authentication**: JWT-based
- **Deployment**: Docker + Nginx + Cloudflare Tunnel
- **SSL/TLS**: Cloudflare (tự động)

### Cấu trúc dự án
```
DevBreak/
├── app-server/          # Backend NestJS
├── app-ui/             # Frontend Next.js
├── nginx/              # Nginx configuration
├── docker-compose.cloudflare.yml  # Production Docker config
├── deploy.sh           # Main deployment script
└── DEPLOYMENT.md       # This file
```

## 🚀 Deployment Process

### Lần đầu setup trên server

1. **Chuẩn bị server:**
```bash
# Install Docker & Docker Compose
sudo apt update
sudo apt install docker.io docker-compose

# Install Cloudflare tunnel
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

2. **Setup Cloudflare tunnel:**
```bash
# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create devbreak-tunnel

# Copy tunnel credentials to server
# File: /home/devtrantrongtri/.cloudflared/4b772a17-651c-437a-bc61-cfd699523e42.json
```

3. **Clone và setup project:**
```bash
git clone <repository-url>
cd DevBreak
chmod +x deploy.sh
```

### Deploy/Update ứng dụng

#### 🔄 Update thông thường (code mới)
```bash
# Pull code mới
git pull origin main

# Deploy với images hiện tại
./deploy.sh
```

#### 🔨 Force rebuild (thay đổi dependencies)
```bash
# Deploy và rebuild tất cả images
./deploy.sh --rebuild
```

#### 🧹 Clean deploy (reset toàn bộ)
```bash
# ⚠️ CẢNH BÁO: Sẽ xóa tất cả dữ liệu!
./deploy.sh --clean
```

## 🐳 Docker Architecture

### Services được tạo:
1. **devbreak_postgres**: PostgreSQL database
2. **devbreak_backend**: NestJS API server  
3. **devbreak_frontend**: Next.js web app
4. **devbreak_nginx**: Nginx reverse proxy

### Port mapping:
- **External**: 80 (HTTP) → Nginx
- **Internal**: 
  - Frontend: 3000
  - Backend: 3000
  - Database: 5432

### Volumes:
- **postgres_data**: Persistent database storage

## 🌐 Network Flow

```
Internet → Cloudflare (SSL) → Tunnel → Server:80 → Nginx
                                                    ├── devtri.xyz → frontend:3000
                                                    └── api.devtri.xyz → backend:3000
```

## 💾 Database Management

### Database persistence
- **Dữ liệu được lưu trong Docker volume**: `postgres_data`
- **Khi deploy thông thường**: Dữ liệu KHÔNG bị mất
- **Khi clean deploy**: Dữ liệu SẼ BỊ XÓA

### Database operations
```bash
# Backup database
docker exec devbreak_postgres pg_dump -U admin user_management > backup.sql

# Restore database  
docker exec -i devbreak_postgres psql -U admin user_management < backup.sql

# Access database
docker exec -it devbreak_postgres psql -U admin -d user_management
```

### Migration & Seeding
- **Auto migration**: Chạy tự động khi backend khởi động
- **Auto seeding**: Tạo admin user và permissions cơ bản
- **Admin account**: admin@system.local / admin123

## 📊 Monitoring & Troubleshooting

### Check status
```bash
# Container status
docker-compose -f docker-compose.cloudflare.yml ps

# Service logs
docker-compose -f docker-compose.cloudflare.yml logs -f [service_name]

# Tunnel status
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f
```

### Health checks
```bash
# Local health checks
curl http://localhost/health          # Backend
curl http://localhost                 # Frontend

# External health checks  
curl https://api.devtri.xyz/health    # Backend API
curl https://devtri.xyz               # Frontend
```

### Common issues

1. **502 Bad Gateway**:
```bash
# Check backend logs
docker logs devbreak_backend

# Restart backend
docker restart devbreak_backend
```

2. **Database connection failed**:
```bash
# Check postgres logs
docker logs devbreak_postgres

# Restart postgres
docker restart devbreak_postgres
```

3. **Tunnel not working**:
```bash
# Restart tunnel
sudo systemctl restart cloudflared

# Check tunnel config
cat /home/devtrantrongtri/.cloudflared/config.yml
```

## 🔧 Configuration Files

### Environment Variables

**Backend (.env):**
```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=password
DB_DATABASE=user_management
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=production
```

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.devtri.xyz
NODE_ENV=production
```

### Nginx Configuration
- **File**: `nginx/nginx.cloudflare.conf`
- **Frontend**: devtri.xyz → frontend:3000
- **Backend**: api.devtri.xyz → backend:3000
- **Features**: Rate limiting, CORS, Security headers

### Cloudflare Tunnel
- **File**: `/home/devtrantrongtri/.cloudflared/config.yml`
- **Tunnel ID**: 4b772a17-651c-437a-bc61-cfd699523e42
- **Domains**: devtri.xyz, api.devtri.xyz

## 🔐 Security

### SSL/TLS
- **Handled by**: Cloudflare (automatic)
- **Certificates**: Managed by Cloudflare
- **HSTS**: Enabled in Nginx

### CORS Configuration
- **Allowed origins**: https://devtri.xyz, localhost
- **Credentials**: Enabled
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS

### Database Security
- **User**: admin (not root)
- **Password**: Set in environment variables
- **Network**: Internal Docker network only

## 📱 Application URLs

### Production
- **Frontend**: https://devtri.xyz
- **Backend API**: https://api.devtri.xyz
- **API Docs**: https://api.devtri.xyz/api
- **Health Check**: https://api.devtri.xyz/health

### Admin Access
- **Email**: admin@system.local
- **Password**: admin123
- **First login**: Change password immediately

## 🆘 Emergency Procedures

### Complete system restart
```bash
# Stop all services
docker-compose -f docker-compose.cloudflare.yml down

# Restart all services
./deploy.sh

# Restart tunnel
sudo systemctl restart cloudflared
```

### Rollback deployment
```bash
# Checkout previous version
git checkout <previous-commit>

# Deploy previous version
./deploy.sh --rebuild
```

### Data recovery
```bash
# If you have backup
docker exec -i devbreak_postgres psql -U admin user_management < backup.sql

# If no backup, clean deploy will recreate basic data
./deploy.sh --clean
```

## 📞 Support

### Useful commands summary
```bash
# Deploy commands
./deploy.sh                    # Normal update
./deploy.sh --rebuild         # Force rebuild  
./deploy.sh --clean           # Clean deploy (⚠️ loses data)

# Monitoring
docker-compose -f docker-compose.cloudflare.yml ps
docker-compose -f docker-compose.cloudflare.yml logs -f
sudo systemctl status cloudflared

# Health checks
curl https://api.devtri.xyz/health
curl https://devtri.xyz
```

### Log locations
- **Application logs**: `docker logs <container_name>`
- **Tunnel logs**: `sudo journalctl -u cloudflared -f`
- **System logs**: `/var/log/`

---

**🎉 Happy Deploying!** 

Nếu gặp vấn đề, hãy kiểm tra logs và sử dụng các lệnh troubleshooting ở trên.
