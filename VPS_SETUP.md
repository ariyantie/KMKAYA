# 🚀 Script Transfer ke VPS dan Instalasi Otomatis

## 📋 Langkah-langkah Deploy ke VPS 31.97.109.207

### 1. Persiapan Files
Semua file sudah siap di direktori `/app/`:
- ✅ Frontend React dengan design KamiKaya
- ✅ Backend FastAPI dengan MongoDB
- ✅ Script deployment otomatis
- ✅ Konfigurasi Nginx
- ✅ Environment files
- ✅ Documentation lengkap

### 2. Transfer Files ke VPS

#### Opsi A: Menggunakan SCP (Secure Copy)
```bash
# Dari komputer lokal, transfer semua files
scp -r /app/* root@31.97.109.207:/tmp/kamikaya-upload/

# Login ke VPS
ssh root@31.97.109.207

# Di VPS, pindahkan files ke direktori yang tepat
mkdir -p /var/www/kamikaya
mv /tmp/kamikaya-upload/* /var/www/kamikaya/
chown -R www-data:www-data /var/www/kamikaya
```

#### Opsi B: Menggunakan Git (Recommended)
```bash
# Di VPS, clone dari repository
ssh root@31.97.109.207
git clone <your-repository-url> /var/www/kamikaya
cd /var/www/kamikaya
```

#### Opsi C: Menggunakan rsync
```bash
# Sync files dengan rsync
rsync -avz --progress /app/ root@31.97.109.207:/var/www/kamikaya/
```

### 3. Install Dependencies di VPS

#### Login ke VPS dan install prerequisites:
```bash
ssh root@31.97.109.207

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Python dan tools
apt install -y python3 python3-pip python3-venv git curl wget htop

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Install Nginx
apt install -y nginx

# Install PM2 dan Yarn
npm install -g pm2 yarn
```

### 4. Jalankan Auto Deployment

```bash
# Masuk ke direktori aplikasi
cd /var/www/kamikaya

# Jalankan script deployment otomatis
chmod +x deploy.sh
./deploy.sh
```

### 5. Verifikasi Installation

#### Cek status services:
```bash
# Cek PM2 processes
pm2 status

# Cek Nginx
systemctl status nginx

# Cek MongoDB
systemctl status mongod

# Test aplikasi
curl http://31.97.109.207
curl http://31.97.109.207/api/health
```

### 6. Konfigurasi Security (Important!)

#### Setup Firewall:
```bash
# Install dan konfigurasi UFW
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
ufw status
```

#### Update MongoDB Security:
```bash
# Edit MongoDB config
nano /etc/mongod.conf

# Tambahkan:
security:
  authorization: enabled

# Restart MongoDB
systemctl restart mongod

# Create database user
mongosh
use kamikaya_db
db.createUser({
  user: "kamikaya_admin",
  pwd: "your_secure_password_here",
  roles: [{ role: "readWrite", db: "kamikaya_db" }]
})
exit

# Update .env file dengan credentials
nano /var/www/kamikaya/backend/.env
# Update MONGO_URL dengan username:password
```

### 7. Setup SSL Certificate (Optional - Recommended)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Dapatkan certificate (ganti dengan domain Anda)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

### 8. Setup Monitoring dan Backup

#### Setup automatic backup:
```bash
# Make backup script executable
chmod +x /var/www/kamikaya/backup.sh

# Add to crontab untuk backup harian jam 2 pagi
(crontab -l; echo "0 2 * * * /var/www/kamikaya/backup.sh") | crontab -
```

#### Setup monitoring:
```bash
# Monitoring script sudah otomatis terinstall
# Cek dengan:
crontab -l

# Manual health check
/usr/local/bin/kamikaya-monitor.sh
```

### 9. Testing Complete Installation

#### Test Frontend:
- Buka browser: `http://31.97.109.207`
- Test semua fitur form
- Test slider pinjaman
- Test navigasi antar step

#### Test Backend API:
```bash
# Health check
curl http://31.97.109.207/api/health

# API docs
curl http://31.97.109.207/api/docs
```

#### Test Database:
```bash
mongosh kamikaya_db
db.loan_applications.countDocuments()
exit
```

### 10. Production Optimization

#### Setup caching:
```bash
# Redis untuk caching (optional)
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

#### Performance tuning:
```bash
# Nginx worker processes
nano /etc/nginx/nginx.conf
# Set worker_processes auto;

# PM2 cluster mode (untuk high traffic)
cd /var/www/kamikaya
pm2 delete kamikaya-backend
pm2 start ecosystem.config.js --instances 2
pm2 save
```

---

## 🔧 Troubleshooting Common Issues

### 1. Port 80 sudah digunakan:
```bash
# Check apa yang menggunakan port 80
netstat -tulpn | grep :80
# Kill process atau ubah konfigurasi
```

### 2. MongoDB tidak bisa connect:
```bash
# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
# Restart service
systemctl restart mongod
```

### 3. Frontend tidak load:
```bash
# Check Nginx error logs
tail -f /var/log/nginx/error.log
# Test Nginx config
nginx -t
```

### 4. Backend API error:
```bash
# Check PM2 logs
pm2 logs kamikaya-backend
# Restart backend
pm2 restart kamikaya-backend
```

---

## 📞 Support Commands

### Restart semua services:
```bash
pm2 restart all
systemctl restart nginx mongod
```

### Check all logs:
```bash
pm2 logs
tail -f /var/log/nginx/access.log
tail -f /var/log/mongodb/mongod.log
```

### Update aplikasi:
```bash
cd /var/www/kamikaya
git pull
./deploy.sh
```

---

**✅ Setelah mengikuti langkah-langkah di atas, aplikasi KamiKaya akan berjalan sempurna di VPS 31.97.109.207!**

**🌐 Access URLs:**
- Frontend: http://31.97.109.207
- Backend API: http://31.97.109.207/api
- API Documentation: http://31.97.109.207/api/docs