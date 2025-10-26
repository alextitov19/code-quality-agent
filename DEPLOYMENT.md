# Deployment Guide for Code Quality Agent

## 🚀 Docker Deployment on EC2

### Prerequisites
- Docker and Docker Compose installed on EC2
- Nginx configured as reverse proxy
- Domain: alextitov.com
- OpenAI API key

---

## 📦 Build Docker Image

```bash
# Build the image
docker build -t code-quality-agent:latest .

# Test the image locally
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_api_key_here \
  code-quality-agent:latest
```

---

## 🐳 Docker Compose Configuration

Add this to your existing `docker-compose.yml`:

```yaml
services:
  code-quality-agent:
    image: code-quality-agent:latest
    container_name: code-quality-agent
    restart: unless-stopped
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
      - PORT=3000
    ports:
      - "3000:3000"
    volumes:
      # Persistent storage for reports
      - ./data/reports:/app/reports
      - ./data/uploads:/app/uploads
      # Optional: Mount temp directory to host for cleanup
      - ./data/temp-repos:/app/temp-repos
    networks:
      - web
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

networks:
  web:
    external: true
```

---

## 🌐 Nginx Configuration

Add to your nginx configuration at `/etc/nginx/sites-available/alextitov.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name alextitov.com www.alextitov.com;
    
    # SSL configuration (if using certbot)
    # listen 443 ssl http2;
    # ssl_certificate /etc/letsencrypt/live/alextitov.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/alextitov.com/privkey.pem;
    
    # Code Quality Agent
    location /code-quality-agent {
        rewrite ^/code-quality-agent/(.*) /$1 break;
        rewrite ^/code-quality-agent$ / break;
        
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        client_max_body_size 50M;
    }
    
    # Static reports
    location /code-quality-agent/reports {
        rewrite ^/code-quality-agent/reports/(.*) /reports/$1 break;
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1h;
    }
}
```

---

## 📋 Deployment Steps

### 1. Prepare Environment Variables

Create `.env` file on your EC2:
```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key
NODE_ENV=production
PORT=3000
```

### 2. Create Data Directories

```bash
mkdir -p data/reports data/uploads data/temp-repos
chmod 755 data
```

### 3. Build and Deploy

```bash
# Clone repository
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent

# Build Docker image
docker build -t code-quality-agent:latest .

# Start with Docker Compose
docker-compose up -d code-quality-agent

# Check logs
docker logs -f code-quality-agent
```

### 4. Configure Nginx

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Verify Deployment

```bash
# Check container status
docker ps | grep code-quality-agent

# Check health
curl http://localhost:3000/

# Check via domain
curl https://alextitov.com/code-quality-agent/
```

---

## 🔧 Maintenance

### View Logs
```bash
docker logs -f code-quality-agent
docker logs --tail 100 code-quality-agent
```

### Restart Service
```bash
docker-compose restart code-quality-agent
```

### Update Application
```bash
git pull
docker build -t code-quality-agent:latest .
docker-compose up -d --force-recreate code-quality-agent
```

### Clean Up Temporary Files
```bash
# Clean old reports (older than 7 days)
find data/reports -name "*.html" -mtime +7 -delete

# Clean temp repositories
rm -rf data/temp-repos/*
```

### Monitor Disk Usage
```bash
du -sh data/*
docker system df
```

---

## 🔒 Security Recommendations

1. **API Key Protection**: Never commit `.env` to git
2. **SSL/TLS**: Use Let's Encrypt for HTTPS
3. **Firewall**: Only expose necessary ports
4. **Updates**: Regularly update dependencies
5. **Backups**: Backup important reports periodically

---

## 📊 Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3000/
```

### Resource Usage
```bash
docker stats code-quality-agent
```

### Error Tracking
```bash
docker logs code-quality-agent 2>&1 | grep -i error
```

---

## 🆘 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs code-quality-agent

# Verify environment variables
docker exec code-quality-agent env | grep OPENAI_API_KEY
```

### Out of Disk Space
```bash
# Clean Docker
docker system prune -a

# Clean temporary files
docker exec code-quality-agent sh -c "rm -rf /app/temp-repos/*"
```

### High Memory Usage
```bash
# Set memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

---

## 🌐 Access URLs

- Main App: `https://alextitov.com/code-quality-agent/`
- API Health: `https://alextitov.com/code-quality-agent/`
- Reports: `https://alextitov.com/code-quality-agent/reports/`

---

**Deployment Date**: October 26, 2025  
**Version**: 1.0.0  
**Maintainer**: Alex Titov
