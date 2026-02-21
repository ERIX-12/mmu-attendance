# Frontend Deployment Guide

## 1. Production Build

### Build for Production
```bash
cd frontend
npm run build
```

### 2. Static Web Server Deployment

### Using Nginx (Recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/mmu-attendance/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Using Apache
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/mmu-attendance/dist
    
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
    
    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api
</VirtualHost>
```

## 2. Cloud Platform Deployment

### Vercel (Recommended for React)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront
```bash
# Build and upload to S3
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure CloudFront distribution
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Deploy
firebase init hosting
firebase deploy --only hosting
```

## 3. Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
```

## 4. Environment Configuration

### Create .env.production
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=MMU Attendance System
VITE_APP_VERSION=1.0.0
```

### Update vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

## 5. CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 6. Performance Optimization

### Build Optimization
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Service Worker for Caching
```javascript
// public/sw.js
const CACHE_NAME = 'mmu-attendance-v1';
const urlsToCache = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

## 7. Security Checklist
- [ ] HTTPS enabled
- [ ] API endpoints secured
- [ ] Environment variables protected
- [ ] Content Security Policy headers
- [ ] XSS protection
- [ ] Rate limiting
- [ ] Regular dependency updates

## 8. Monitoring and Analytics

### Add error tracking
```javascript
// src/utils/errorTracking.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

### Performance monitoring
```javascript
// src/utils/analytics.js
import ReactGA from 'react-ga';

ReactGA.initialize('GA_MEASUREMENT_ID');
ReactGA.pageview(window.location.pathname);
```

## 9. Quick Deploy Commands

### Vercel (Easiest)
```bash
npm i -g vercel
cd frontend
vercel --prod
```

### Netlify
```bash
npm i -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
# Update vite.config.js
base: '/your-repo-name/',
# Build and deploy to gh-pages branch
```
