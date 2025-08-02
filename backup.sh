#!/bin/bash

# KamiKaya Backup Script
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="/backup/kamikaya"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/kamikaya"
MONGO_DB="kamikaya_db"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
print_status "Creating backup directory..."
sudo mkdir -p $BACKUP_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

# Create timestamped backup folder
BACKUP_PATH="$BACKUP_DIR/backup_$DATE"
mkdir -p $BACKUP_PATH

print_status "Starting backup process..."

# 1. Backup MongoDB
print_status "Backing up MongoDB database..."
if command -v mongodump &> /dev/null; then
    mongodump --db $MONGO_DB --out $BACKUP_PATH/mongodb/
    print_status "MongoDB backup completed"
else
    print_error "mongodump not found. Installing mongo-tools..."
    sudo apt-get install -y mongo-tools
    mongodump --db $MONGO_DB --out $BACKUP_PATH/mongodb/
fi

# 2. Backup application files
print_status "Backing up application files..."
mkdir -p $BACKUP_PATH/application

# Backup backend
cp -r $APP_DIR/backend $BACKUP_PATH/application/
# Remove virtual environment (too large)
rm -rf $BACKUP_PATH/application/backend/venv

# Backup frontend
cp -r $APP_DIR/frontend $BACKUP_PATH/application/
# Remove node_modules (too large)
rm -rf $BACKUP_PATH/application/frontend/node_modules

# Backup configuration files
cp $APP_DIR/ecosystem.config.js $BACKUP_PATH/application/ 2>/dev/null || true
cp /etc/nginx/sites-available/kamikaya $BACKUP_PATH/nginx.conf 2>/dev/null || true

print_status "Application files backup completed"

# 3. Backup uploaded files
print_status "Backing up uploaded files..."
if [ -d "$APP_DIR/backend/uploads" ]; then
    cp -r $APP_DIR/backend/uploads $BACKUP_PATH/
    print_status "Uploaded files backup completed"
else
    print_warning "No uploads directory found"
fi

# 4. Backup system configuration
print_status "Backing up system configuration..."
mkdir -p $BACKUP_PATH/system

# PM2 configuration
pm2 save --force 2>/dev/null || true
if [ -f ~/.pm2/dump.pm2 ]; then
    cp ~/.pm2/dump.pm2 $BACKUP_PATH/system/
fi

# Crontab
crontab -l > $BACKUP_PATH/system/crontab.txt 2>/dev/null || echo "No crontab found" > $BACKUP_PATH/system/crontab.txt

print_status "System configuration backup completed"

# 5. Create backup info file
print_status "Creating backup information file..."
cat > $BACKUP_PATH/backup_info.txt << EOF
KamiKaya Application Backup
==========================
Backup Date: $(date)
Backup Path: $BACKUP_PATH
Server IP: $(curl -s ifconfig.me 2>/dev/null || echo "Unknown")
Hostname: $(hostname)

Contents:
- MongoDB database ($MONGO_DB)
- Application files (backend & frontend)
- Uploaded files
- System configuration
- PM2 processes
- Crontab

Restore Instructions:
1. Stop all services: pm2 stop all && sudo systemctl stop nginx mongod
2. Restore MongoDB: mongorestore --db $MONGO_DB $BACKUP_PATH/mongodb/$MONGO_DB/
3. Restore application: cp -r $BACKUP_PATH/application/* /var/www/kamikaya/
4. Restore uploads: cp -r $BACKUP_PATH/uploads /var/www/kamikaya/backend/
5. Restore PM2: pm2 resurrect $BACKUP_PATH/system/dump.pm2
6. Start services: sudo systemctl start mongod nginx && pm2 start all

Notes:
- Remember to reinstall dependencies after restore
- Update environment variables if needed
- Test all services after restore
EOF

# 6. Create compressed archive
print_status "Creating compressed archive..."
cd $BACKUP_DIR
tar -czf "kamikaya_backup_$DATE.tar.gz" "backup_$DATE"

# 7. Calculate backup size
BACKUP_SIZE=$(du -sh "kamikaya_backup_$DATE.tar.gz" | cut -f1)
print_status "Backup archive created: kamikaya_backup_$DATE.tar.gz ($BACKUP_SIZE)"

# 8. Cleanup old backups (keep last 7 days)
print_status "Cleaning up old backups..."
find $BACKUP_DIR -name "kamikaya_backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "backup_*" -mtime +7 -type d -exec rm -rf {} + 2>/dev/null || true

# 9. List recent backups
print_status "Recent backups:"
ls -lah $BACKUP_DIR/kamikaya_backup_*.tar.gz 2>/dev/null | tail -5 || echo "No backup files found"

print_status "Backup completed successfully! 🎉"
echo ""
echo "📁 Backup Location: $BACKUP_PATH"
echo "📦 Archive: $BACKUP_DIR/kamikaya_backup_$DATE.tar.gz"
echo "📊 Size: $BACKUP_SIZE"
echo ""
print_warning "To restore from this backup, see: $BACKUP_PATH/backup_info.txt"