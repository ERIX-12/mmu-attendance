# Deployment Commands

## Step 1: Connect to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/mmu-attendance.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `mmu-attendance` repository
4. Railway will auto-detect Django
5. Add environment variables:
   - `DEBUG=False`
   - `SECRET_KEY=your-secret-key-here`
   - `DATABASE_URL=postgresql://postgres:password@localhost:5432/mmu_attendance`
6. Click "Deploy"

## Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select your `mmu-attendance` repository
4. Vercel will auto-detect React
5. Add environment variable:
   - `VITE_API_URL=https://your-railway-app.railway.app/api`
6. Click "Deploy"

## Step 4: Update URLs
After deployment:
1. Get your Railway URL (e.g., `mmu-attendance-production.up.railway.app`)
2. Get your Vercel URL (e.g., `mmu-attendance.vercel.app`)
3. Update CORS settings in backend
4. Update frontend API URL

## Step 5: Test
1. Visit your Vercel URL
2. Test login, registration, and all features
3. Test QR code scanning on mobile
