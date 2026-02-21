# 🚀 MMU Attendance System - Quick Deployment Guide

## 📋 **Option 1: Vercel + Railway (Easiest - 15 minutes)**

### **Backend on Railway**
1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Add environment variables:**
   ```
   DEBUG=False
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```
4. **Deploy** - Railway will auto-detect Django

### **Frontend on Vercel**
1. **Go to [vercel.com](https://vercel.com)**
2. **Connect GitHub repository**
3. **Add environment variable:**
   ```
   VITE_API_URL=https://your-railway-app.railway.app/api
   ```
4. **Deploy** - Vercel will auto-detect React

---

## 📋 **Option 2: Docker + Cloud (30 minutes)**

### **1. Create Dockerfiles**
```bash
# Backend Dockerfile (already created)
# Frontend Dockerfile (already created)
```

### **2. Deploy to DigitalOcean**
```bash
# Create droplet with Docker
git clone https://github.com/your-repo
cd mmu-attendance
docker-compose up -d
```

---

## 📋 **Option 3: Traditional Hosting (45 minutes)**

### **Backend Setup**
```bash
# 1. Server setup
sudo apt update
sudo apt install python3 python3-pip postgresql nginx

# 2. Clone and setup
git clone https://github.com/your-repo
cd mmu-attendance/backend
pip3 install -r requirements.txt

# 3. Database
sudo -u postgres createdb mmu_attendance
python3 manage.py migrate
python3 manage.py createsuperuser

# 4. Production server
pip3 install gunicorn
gunicorn --workers 3 --bind 0.0.0.0:8000 mmu_attendance.wsgi:application
```

### **Frontend Setup**
```bash
# 1. Build
cd ../frontend
npm install
npm run build

# 2. Serve with Nginx
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

---

## 🔧 **Fix Current Proxy Issue**

### **Quick Fix for Local Development**
1. **Stop current frontend:** Ctrl+C in frontend terminal
2. **Update .env file:**
   ```
   VITE_API_URL=http://localhost:8000/api
   ```
3. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### **Or Direct Backend Calls**
Update `frontend/src/api/client.js`:
```javascript
const BASE_URL = 'http://localhost:8000/api';  // Direct backend URL
```

---

## 📱 **Mobile Access After Deployment**

### **Local Network**
```bash
# Find your IP
ipconfig | findstr "IPv4"

# Access from phone
http://YOUR_IP:5173
```

### **After Cloud Deployment**
```
https://your-domain.com    # Frontend
https://api.your-domain.com  # Backend API
```

---

## ✅ **Pre-Deployment Checklist**

### **Backend**
- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY`
- [ ] Database configured
- [ ] CORS origins set
- [ ] Static files collected

### **Frontend**
- [ ] Environment variables set
- [ ] Build successful
- [ ] API URL correct
- [ ] HTTPS configured

### **Security**
- [ ] HTTPS enabled
- [ ] Environment variables hidden
- [ ] API endpoints protected
- [ ] Database credentials secure

---

## 🚀 **One-Click Deploy Options**

### **Backend**
- [Railway](https://railway.app) - Auto Django detection
- [Heroku](https://heroku.com) - Add Procfile
- [DigitalOcean App Platform](https://cloud.digitalocean.com)

### **Frontend**
- [Vercel](https://vercel.com) - Auto React detection
- [Netlify](https://netlify.com) - Drag & drop dist folder
- [Firebase Hosting](https://firebase.google.com) - Free tier available

---

## 📞 **Support Links**

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Django Deployment:** https://docs.djangoproject.com/en/stable/howto/deployment/
- **React Deployment:** https://reactjs.org/docs/deployment.html

Choose the option that best fits your needs! 🎯
