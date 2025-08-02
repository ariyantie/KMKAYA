# 🏦 KamiKaya - Aplikasi Pinjaman Online

Aplikasi pinjaman online yang menyerupai platform KamiKaya dengan fitur lengkap untuk pengajuan pinjaman, verifikasi dokumen, dan manajemen aplikasi.

## 🚀 Fitur Utama

- ✅ **Multi-Step Form**: Formulir pengajuan pinjaman bertahap
- ✅ **Upload Dokumen**: Verifikasi KTP dan foto selfie
- ✅ **Kalkulator Pinjaman**: Slider interaktif untuk menentukan jumlah pinjaman
- ✅ **Responsive Design**: Mobile-first design yang optimal
- ✅ **Backend API**: REST API lengkap dengan FastAPI
- ✅ **Database**: MongoDB untuk penyimpanan data
- ✅ **Admin Dashboard**: Manajemen aplikasi pinjaman

## 🛠️ Tech Stack

- **Frontend**: React 19 + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Web Server**: Nginx
- **Process Manager**: PM2
- **File Upload**: Aiofiles

## 📋 Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd kamikaya-app
```

### 2. Auto Deployment (Recommended)
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Manual Setup
Ikuti panduan lengkap di [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🌐 VPS Deployment

Aplikasi ini dirancang untuk deployment di VPS dengan spesifikasi:
- **IP**: 31.97.109.207
- **OS**: Ubuntu 20.04+ atau CentOS 7+
- **RAM**: Minimal 2GB
- **Storage**: Minimal 10GB
- **Bandwidth**: Unlimited

## 📱 Demo Features

### Frontend Features:
- **Landing Page**: Hero section dengan kalkulator pinjaman
- **Step 1**: Informasi perusahaan dan visi misi
- **Step 2**: Form data pribadi lengkap
- **Step 3**: Informasi keuangan dan tujuan pinjaman
- **Step 4**: Upload dokumen KTP dan selfie

### Backend Features:
- **POST /loan/apply**: Submit aplikasi pinjaman
- **GET /loan/applications**: List semua aplikasi
- **GET /loan/application/{id}**: Detail aplikasi
- **PUT /loan/application/{id}/status**: Update status aplikasi
- **GET /stats**: Statistik aplikasi

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
MONGO_URL=mongodb://username:password@localhost:27017/kamikaya_db
JWT_SECRET=your_super_secret_key
API_HOST=0.0.0.0
API_PORT=8001
ENVIRONMENT=production
```

**Frontend (.env.production)**:
```env
REACT_APP_BACKEND_URL=http://your-vps-ip/api
GENERATE_SOURCEMAP=false
```

## 📊 API Documentation

Setelah deployment, akses dokumentasi API di:
- **Swagger UI**: `http://your-vps-ip/api/docs`
- **ReDoc**: `http://your-vps-ip/api/redoc`

## 🔐 Security Features

- CORS protection
- Input validation
- File upload security
- MongoDB authentication
- Nginx security headers
- UFW firewall configuration

## 📈 Monitoring

### Health Checks:
```bash
# Check application status
pm2 status

# View logs
pm2 logs kamikaya-backend

# Monitor resources
pm2 monit
```

### Service Management:
```bash
# Restart backend
pm2 restart kamikaya-backend

# Restart web server
sudo systemctl restart nginx

# Restart database
sudo systemctl restart mongod
```

## 🛡️ Production Checklist

- [ ] Update MongoDB credentials
- [ ] Configure SSL certificate
- [ ] Set up domain name
- [ ] Configure automated backups
- [ ] Set up monitoring alerts
- [ ] Configure log rotation
- [ ] Update firewall rules
- [ ] Test disaster recovery

## 📞 Support

Untuk bantuan deployment dan troubleshooting:

1. **Check logs**: `/var/www/kamikaya/logs/`
2. **Monitor health**: `/usr/local/bin/kamikaya-monitor.sh`
3. **View documentation**: `DEPLOYMENT_GUIDE.md`

## 🔄 Updates

Untuk update aplikasi:
```bash
cd /var/www/kamikaya
git pull
./deploy.sh
```

## 📄 License

Private License - Hanya untuk penggunaan internal.

---

**✅ Aplikasi siap production dengan semua fitur lengkap!**