# 🎯 URL ADMIN DASHBOARD KAMIKAYA

## 📍 **URL Backend Admin Dashboard:**

### **Production URL (Setelah Deploy di VPS):**
```
http://31.97.109.207/admin
```

### **Development URL (Local):**
```
http://localhost:8001/admin
```

---

## 🖥️ **Admin Dashboard Features:**

### 📊 **Dashboard Overview** (`/admin`)
- **Total Statistics**: Jumlah aplikasi, pending, approved, rejected
- **Total Loan Amount**: Jumlah total pinjaman yang diajukan
- **Recent Applications**: 10 aplikasi terbaru
- **Quick Actions**: Akses cepat ke fitur utama

### 📋 **Applications List** (`/admin/applications`)
- **Filter by Status**: All, Pending, Approved, Rejected
- **Pagination**: 20 aplikasi per halaman
- **Search & Sort**: Berdasarkan nama, tanggal, jumlah
- **Bulk Actions**: Update status multiple aplikasi

### 🔍 **Application Detail** (`/admin/application/{id}`)
- **Personal Information**: Data lengkap pemohon
- **Financial Information**: Pekerjaan dan penghasilan
- **Loan Information**: Jumlah dan tujuan pinjaman
- **Document Status**: Status upload KTP dan selfie
- **Status Update**: Change status dengan 1 click
- **Quick Actions**: Call, email, print langsung

### 📈 **Additional Features:**
- **Timeline**: History perubahan status aplikasi
- **Document Viewer**: Preview KTP dan selfie yang diupload
- **Contact Integration**: Direct call dan email
- **Print Functionality**: Print detail aplikasi
- **Responsive Design**: Mobile-friendly admin panel

---

## 🔐 **Access Control (Future Enhancement):**

Untuk production, disarankan menambahkan:
- **Login System**: Username/password untuk admin
- **Role-Based Access**: Different permission levels
- **Session Management**: Secure admin sessions
- **Audit Log**: Track admin activities

---

## 🚀 **Cara Akses Admin Dashboard:**

### **1. Setelah Deployment Complete:**
```bash
# Buka browser dan akses:
http://31.97.109.207/admin
```

### **2. Menu Admin Dashboard:**
- **Dashboard** → Overview statistik
- **Applications** → List semua aplikasi
- **Detail** → Klik aplikasi untuk detail lengkap
- **Status Update** → Update status aplikasi

### **3. Quick Navigation:**
- 🏠 Dashboard: `/admin`
- 📄 All Applications: `/admin/applications`
- ⏳ Pending Apps: `/admin/applications?status=pending`
- ✅ Approved Apps: `/admin/applications?status=approved`
- ❌ Rejected Apps: `/admin/applications?status=rejected`

---

## 🛠️ **Tech Stack Admin Dashboard:**

- **Backend**: FastAPI dengan Jinja2 Templates
- **Frontend**: HTML + TailwindCSS + FontAwesome
- **Database**: MongoDB untuk storage
- **Styling**: Responsive design dengan dark/light theme
- **Icons**: FontAwesome untuk UI icons

---

## 📱 **Mobile Responsive:**

Admin dashboard fully responsive untuk akses via:
- 💻 **Desktop**: Full featured admin panel
- 📱 **Mobile**: Touch-friendly mobile interface
- 📊 **Tablet**: Optimized tablet layout

---

**✅ Admin Dashboard sudah siap digunakan setelah deployment!**

**🔗 Direct Access**: http://31.97.109.207/admin