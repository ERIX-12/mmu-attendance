#!/bin/bash

echo "🚀 MMU Attendance System Deployment"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: MMU Attendance System"
    
    # Create GitHub repository (you need to do this manually)
    echo "⚠️  Please create a GitHub repository named 'mmu-attendance'"
    echo "   Then run: git remote add origin https://github.com/YOUR_USERNAME/mmu-attendance.git"
    echo "   Then run: git push -u origin main"
    exit 1
fi

echo "✅ Git repository found"

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "✅ Frontend built successfully"

# Test backend
echo "🧪 Testing backend..."
cd backend
python manage.py check
if [ $? -eq 0 ]; then
    echo "✅ Backend checks passed"
else
    echo "❌ Backend checks failed"
    exit 1
fi

cd ..

echo "🎉 Ready for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy backend to Railway.app"
echo "3. Deploy frontend to Vercel.com"
echo ""
echo "📖 See deploy guides for detailed instructions"
