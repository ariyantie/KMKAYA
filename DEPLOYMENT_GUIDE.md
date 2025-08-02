# 📋 Panduan Deployment Aplikasi Pinjol KamiKaya ke VPS

## 🖥️ Informasi VPS
- **IP Address:** 31.97.109.207
- **Aplikasi:** KamiKaya Pinjaman Online
- **Tech Stack:** React Frontend + FastAPI Backend + MongoDB

---

## 🔧 Prerequisites & System Requirements

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Essential Tools
```bash
# Install basic tools
sudo apt install -y curl wget git vim htop unzip

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.9+
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2

# Install Yarn package manager
npm install -g yarn
```

---

## 📂 Setup Project Directory

### 1. Create Application Directory
```bash
sudo mkdir -p /var/www/kamikaya
sudo chown -R $USER:$USER /var/www/kamikaya
cd /var/www/kamikaya
```

### 2. Clone/Upload Project Files
```bash
# Option 1: If using Git
git clone <your-repo-url> .

# Option 2: Upload files manually via SCP
# scp -r ./kamikaya-app/* user@31.97.109.207:/var/www/kamikaya/
```

---

## 🗄️ Database Setup (MongoDB)

### 1. Start MongoDB Service
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### 2. Create Database and User
```bash
mongosh

# In MongoDB shell:
use kamikaya_db

# Create admin user
db.createUser({
  user: "kamikaya_admin",
  pwd: "your_secure_password_here",
  roles: [
    { role: "readWrite", db: "kamikaya_db" }
  ]
})

# Exit MongoDB shell
exit
```

### 3. Configure MongoDB Security
```bash
sudo nano /etc/mongod.conf

# Add/modify these lines:
security:
  authorization: enabled

net:
  port: 27017
  bindIp: 127.0.0.1

# Restart MongoDB
sudo systemctl restart mongod
```

---

## 🖥️ Backend Setup (FastAPI)

### 1. Create Backend Environment
```bash
cd /var/www/kamikaya/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Backend Environment
```bash
# Create .env file
nano .env

# Add these configurations:
MONGO_URL=mongodb://kamikaya_admin:your_secure_password_here@localhost:27017/kamikaya_db
JWT_SECRET=your_jwt_secret_key_here
API_HOST=0.0.0.0
API_PORT=8001
ENVIRONMENT=production
ALLOWED_ORIGINS=http://31.97.109.207,https://31.97.109.207,http://yourdomain.com,https://yourdomain.com
```

### 3. Create Backend PM2 Configuration
```bash
nano ecosystem.config.js

# Add this content:
module.exports = {
  apps: [{
    name: 'kamikaya-backend',
    script: 'venv/bin/python',
    args: '-m uvicorn main:app --host 0.0.0.0 --port 8001',
    cwd: '/var/www/kamikaya/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 🌐 Frontend Setup (React)

### 1. Install Frontend Dependencies
```bash
cd /var/www/kamikaya/frontend

# Install dependencies
yarn install
```

### 2. Configure Frontend Environment
```bash
# Create production .env file
nano .env.production

# Add these configurations:
REACT_APP_BACKEND_URL=http://31.97.109.207:8001
GENERATE_SOURCEMAP=false
```

### 3. Build Frontend for Production
```bash
# Build the React app
yarn build

# The build files will be in the 'build' directory
```

---

## 🔧 Nginx Configuration

### 1. Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/kamikaya

# Add this configuration:
server {
    listen 80;
    server_name 31.97.109.207 yourdomain.com www.yourdomain.com;

    # Frontend (React App)
    location / {
        root /var/www/kamikaya/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (FastAPI)
    location /api {
        rewrite ^/api(.*) $1 break;
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Hide Nginx version
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

### 2. Enable the Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/kamikaya /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🚀 Start Applications

### 1. Start Backend with PM2
```bash
cd /var/www/kamikaya/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Check Application Status
```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check Nginx status
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod
```

---

## 🔐 SSL Certificate Setup (Optional - Recommended)

### 1. Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate
```bash
# Replace with your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🔥 Firewall Configuration

### 1. Configure UFW Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow MongoDB (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 27017

# Check status
sudo ufw status
```

---

## 📊 Monitoring & Maintenance

### 1. Setup Monitoring Scripts
```bash
# Create monitoring script
sudo nano /usr/local/bin/kamikaya-monitor.sh

#!/bin/bash
# KamiKaya Application Health Check

# Check if backend is running
if ! pm2 describe kamikaya-backend > /dev/null 2>&1; then
    echo "Backend is down, restarting..."
    cd /var/www/kamikaya/backend
    pm2 restart kamikaya-backend
fi

# Check MongoDB
if ! systemctl is-active --quiet mongod; then
    echo "MongoDB is down, restarting..."
    sudo systemctl restart mongod
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down, restarting..."
    sudo systemctl restart nginx
fi

# Make executable
sudo chmod +x /usr/local/bin/kamikaya-monitor.sh

# Add to crontab for every 5 minutes check
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/kamikaya-monitor.sh") | crontab -
```

### 2. Log Management
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/kamikaya

/var/www/kamikaya/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload kamikaya-backend
    endscript
}
```

---

## 🧪 Testing Deployment

### 1. Test Backend API
```bash
# Test backend health
curl http://31.97.109.207:8001/health

# Test API endpoint
curl http://31.97.109.207/api/health
```

### 2. Test Frontend
```bash
# Access frontend
curl http://31.97.109.207

# Check if all assets load properly
curl -I http://31.97.109.207/static/css/main.css
```

---

## 🔧 Troubleshooting

### Common Issues:

1. **Backend won't start:**
   ```bash
   cd /var/www/kamikaya/backend
   source venv/bin/activate
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

2. **MongoDB connection issues:**
   ```bash
   sudo systemctl status mongod
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Frontend build issues:**
   ```bash
   cd /var/www/kamikaya/frontend
   rm -rf node_modules package-lock.json
   yarn install
   yarn build
   ```

---

## 📱 Access Your Application

- **Frontend:** http://31.97.109.207
- **Backend API:** http://31.97.109.207/api
- **API Documentation:** http://31.97.109.207/api/docs
- **🔥 Admin Dashboard:** http://31.97.109.207/admin

### 👨‍💼 Admin Dashboard
Dashboard admin dilengkapi dengan:
- **Overview Statistics**: Total aplikasi, pending, approved, rejected
- **Application Management**: List, filter, dan pagination aplikasi
- **Status Updates**: Update status aplikasi secara real-time
- **Detailed Views**: Informasi lengkap setiap aplikasi
- **Quick Actions**: Call, email, dan print langsung dari dashboard
- **Document Tracking**: Monitor status upload KTP dan selfie

---

## 🔄 Update Deployment

### To update the application:
```bash
# Pull latest changes
cd /var/www/kamikaya
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart kamikaya-backend

# Update frontend
cd ../frontend
yarn install
yarn build
sudo systemctl reload nginx
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks:
- Monitor disk space: `df -h`
- Check system resources: `htop`
- Review logs: `pm2 logs`
- Update system packages: `sudo apt update && sudo apt upgrade`
- Backup MongoDB: `mongodump --db kamikaya_db --out /backup/$(date +%Y%m%d)`

---

**✅ Deployment Complete!**

Aplikasi KamiKaya Anda sekarang siap digunakan di VPS dengan IP 31.97.109.207. Pastikan untuk mengamankan kredensial database dan menggunakan HTTPS untuk production.