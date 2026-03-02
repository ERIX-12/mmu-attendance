# 🌍 Environment Variables Setup Guide

## 🔑 Generated Secret Key
```
SECRET_KEY=')1*OW"tvSO&av|#+;E7RIrV7!TESa`,Y_L9WHIcbA]6/pZRB9'
```

## 🚂 Railway (Backend) Environment Variables

### **Required Variables:**
```
DEBUG=False
SECRET_KEY=')1*OW"tvSO&av|#+;E7RIrV7!TESa`,Y_L9WHIcbA]6/pZRB9'
DATABASE_URL=postgresql://postgres:password@localhost:5432/mmu_attendance
ALLOWED_HOSTS=*
```

### **How to Add:**
1. **Go to railway.app**
2. **Select your project**
3. **Click "Variables" tab**
4. **Click "New Variable"**
5. **Add each variable:**
   - **Name:** `DEBUG`
   - **Value:** `False`
   - **Name:** `SECRET_KEY`
   - **Value:** `')1*OW"tvSO&av|#+;E7RIrV7!TESa`,Y_L9WHIcbA]6/pZRB9'`
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:password@localhost:5432/mmu_attendance`
   - **Name:** `ALLOWED_HOSTS`
   - **Value:** `*`

## 🌐 Vercel (Frontend) Environment Variables

### **Required Variables:**
```
VITE_API_URL=https://your-railway-app.railway.app/api
```

### **How to Add:**
1. **Go to vercel.com**
2. **Select your project**
3. **Click "Settings" → "Environment Variables"**
4. **Click "Add New"**
5. **Add variable:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-railway-app.railway.app/api`
   - **Environments:** Production, Preview, Development

## 🔄 After Deployment URL Updates

### **Step 1: Get Railway URL**
After Railway deployment, you'll get a URL like:
```
https://mmu-attendance-production.up.railway.app
```

### **Step 2: Update Frontend**
In Vercel, update the API URL:
```
VITE_API_URL=https://mmu-attendance-production.up.railway.app/api
```

### **Step 3: Update Backend**
In Railway, update CORS settings:
```
CORS_ALLOWED_ORIGINS = ["https://mmu-attendance.vercel.app"]
```

## 📋 Quick Copy-Paste Variables

### **Railway (copy these):**
```
DEBUG=False
SECRET_KEY=')1*OW"tvSO&av|#+;E7RIrV7!TESa`,Y_L9WHIcbA]6/pZRB9'
DATABASE_URL=postgresql://postgres:password@localhost:5432/mmu_attendance
ALLOWED_HOSTS=*
```

### **Vercel (copy this):**
```
VITE_API_URL=https://mmu-attendance-production.up.railway.app/api
```

## ⚠️ Important Notes

1. **Keep SECRET_KEY secure** - Don't share it publicly
2. **Update URLs after deployment** - Replace placeholder URLs
3. **Test both frontend and backend** - Ensure they connect properly
4. **Use HTTPS** - Both platforms support secure connections

## 🚀 Deployment Checklist

- [ ] Railway project created
- [ ] Backend environment variables added
- [ ] Vercel project created  
- [ ] Frontend environment variables added
- [ ] URLs updated after deployment
- [ ] Both services deployed successfully
- [ ] Test all features on deployed URLs
