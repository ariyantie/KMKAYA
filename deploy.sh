#!/bin/bash

# KamiKaya Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting KamiKaya deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/kamikaya"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NGINX_SITE="/etc/nginx/sites-available/kamikaya"

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Create app directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy project files
print_status "Copying project files..."
cp -r ./backend $APP_DIR/
cp -r ./frontend $APP_DIR/
cp ./ecosystem.config.js $APP_DIR/
cp ./DEPLOYMENT_GUIDE.md $APP_DIR/

# Setup backend
print_status "Setting up backend..."
cd $BACKEND_DIR

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create logs directory
mkdir -p $APP_DIR/logs

# Setup frontend
print_status "Setting up frontend..."
cd $FRONTEND_DIR

# Install Node.js dependencies
yarn install

# Create production environment file
cat > .env.production << EOF
REACT_APP_BACKEND_URL=http://$(curl -s ifconfig.me)/api
GENERATE_SOURCEMAP=false
EOF

# Build for production
yarn build

# Setup MongoDB
print_status "Setting up MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Setup Nginx configuration
print_status "Setting up Nginx..."
sudo tee $NGINX_SITE > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # Frontend (React App)
    location / {
        root $FRONTEND_DIR/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (FastAPI)
    location /api {
        rewrite ^/api(.*) \$1 break;
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Enable Nginx site
sudo ln -sf $NGINX_SITE /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services
print_status "Starting services..."

# Start backend with PM2
cd $APP_DIR
pm2 delete kamikaya-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Restart Nginx
sudo systemctl restart nginx

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create monitoring script
print_status "Setting up monitoring..."
sudo tee /usr/local/bin/kamikaya-monitor.sh > /dev/null << 'EOF'
#!/bin/bash
# KamiKaya Application Health Check

# Check if backend is running
if ! pm2 describe kamikaya-backend > /dev/null 2>&1; then
    echo "$(date): Backend is down, restarting..." >> /var/log/kamikaya-monitor.log
    cd /var/www/kamikaya
    pm2 restart kamikaya-backend
fi

# Check MongoDB
if ! systemctl is-active --quiet mongod; then
    echo "$(date): MongoDB is down, restarting..." >> /var/log/kamikaya-monitor.log
    sudo systemctl restart mongod
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx is down, restarting..." >> /var/log/kamikaya-monitor.log
    sudo systemctl restart nginx
fi
EOF

sudo chmod +x /usr/local/bin/kamikaya-monitor.sh

# Add to crontab for health checks every 5 minutes
(crontab -l 2>/dev/null | grep -v kamikaya-monitor; echo "*/5 * * * * /usr/local/bin/kamikaya-monitor.sh") | crontab -

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

print_status "Deployment completed successfully! 🎉"
echo ""
echo "📱 Your KamiKaya application is now available at:"
echo "   Frontend: http://$SERVER_IP"
echo "   Backend API: http://$SERVER_IP/api"
echo "   API Docs: http://$SERVER_IP/api/docs"
echo ""
echo "🔧 Service Status:"
pm2 status
echo ""
sudo systemctl status nginx --no-pager -l
echo ""
sudo systemctl status mongod --no-pager -l
echo ""
print_status "Deployment logs are available in $APP_DIR/logs/"
print_status "Monitor your application with: pm2 monit"
echo ""
print_warning "Don't forget to:"
echo "   1. Update MongoDB credentials in production"
echo "   2. Set up SSL certificate for HTTPS"
echo "   3. Configure domain name if applicable"
echo "   4. Set up regular backups"