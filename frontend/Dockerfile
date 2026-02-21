FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
# Copy built static files to Nginx serve directory
COPY --from=builder /app/dist /usr/share/nginx/html
# React Router support: fallback to index.html for unknown routes
# Custom nginx config is mounted via docker-compose, this is just a backup
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
