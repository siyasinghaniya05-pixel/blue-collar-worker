# KaushalID — Production Deployment & Operations Guide

This guide details the procedure for building, configuring, containerizing, and running **KaushalID** in a production environment.

---

## 1. Environment Variables Specification

### 1.1 Backend Environment (`server/.env`)

```ini
# Server Port & Environment
PORT=5000
NODE_ENV=production

# Cryptographic Token Secret (HMAC-SHA256)
JWT_SECRET=kaushalid_production_secret_key_change_in_real_deployment_2026

# Allowed Frontend Origins (Comma-separated for multi-domain)
CORS_ORIGIN=http://localhost:3000,https://kaushalid.in,https://www.kaushalid.in

# Commercial / Payment Gateway Configuration
# Mode: 'sandbox' (Default development mock) or 'production' (Razorpay/Cashfree live)
PAYMENT_MODE=sandbox

# Database Persistence File Path
DATA_FILE_PATH=./data/kaushalid_db.json
```

### 1.2 Frontend Environment (`client/.env.production`)

```ini
# Base URL for API requests. In unified production deployment, leave empty or root '/'
VITE_API_BASE_URL=/api
```

---

## 2. Production Build Workflow

KaushalID can be compiled and served as a unified monolithic service (Express serving Vite's compiled static bundle) or as a decoupled client/API architecture.

### Step 1: Install Dependencies
```bash
# In workspace root
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Step 2: Compile Client Assets
```bash
cd client
npm run build
cd ..
```
*Compiled assets will be placed in `client/dist/`.*

### Step 3: Launch Production Server
```bash
cd server
NODE_ENV=production PORT=5000 npm start
```
*When `NODE_ENV=production`, Express automatically mounts `client/dist` and handles HTML5 push-state client-side routing.*

---

## 3. Containerized Deployment (Docker)

### Multi-Stage `Dockerfile`
Create the following `Dockerfile` in the root of the project:

```dockerfile
# Stage 1: Build Frontend Assets
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Server Runtime
FROM node:18-alpine AS server-runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/server.js"]
```

### Build & Run Container:
```bash
docker build -t kaushalid:latest .
docker run -d -p 5000:5000 --name kaushalid-prod -v $(pwd)/server/data:/app/server/data kaushalid:latest
```

---

## 4. Reverse Proxy Configuration (Nginx)

For deployments behind Nginx with SSL termination and gzip compression:

```nginx
server {
    listen 80;
    server_name kaushalid.in www.kaushalid.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kaushalid.in www.kaushalid.in;

    ssl_certificate /etc/letsencrypt/live/kaushalid.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kaushalid.in/privkey.pem;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. Health Monitoring & Verification

Automated uptime monitoring can query the health endpoint:

```bash
curl -f http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "platform": "KaushalID Platform API",
  "version": "1.0.0",
  "timestamp": "2026-10-26T17:25:00.000Z",
  "collections": {
    "workers": 8,
    "credentials": 6,
    "assessmentRequests": 6
  }
}
```
