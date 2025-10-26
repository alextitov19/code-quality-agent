# 📋 Quick Integration Checklist

## Files to Update on Your EC2

### 1. `/home/ec2-user/app/nginx.conf`

**ADD** these two location blocks inside the HTTPS server section (before the main "/" location):

```nginx
# Code Quality Agent
location /code-quality-agent {
    rewrite ^/code-quality-agent/(.*) /$1 break;
    rewrite ^/code-quality-agent$ / break;
    proxy_pass http://code-quality-agent:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_connect_timeout 60s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    client_max_body_size 50M;
}

location /code-quality-agent/reports {
    rewrite ^/code-quality-agent/reports/(.*) /reports/$1 break;
    proxy_pass http://code-quality-agent:3000;
    proxy_set_header Host $host;
    proxy_cache_valid 200 1h;
}
```

---

### 2. `/home/ec2-user/app/docker-compose.yml`

**ADD** this service (after personal-website, before nginx):

```yaml
  code-quality-agent:
    image: code-quality-agent:latest
    container_name: code-quality-agent
    restart: unless-stopped
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
      - PORT=3000
    networks:
      - webnet
    expose:
      - "3000"
    volumes:
      - ./code-quality-data/reports:/app/reports
      - ./code-quality-data/uploads:/app/uploads
      - ./code-quality-data/temp-repos:/app/temp-repos
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**UPDATE** nginx service to add dependency:

```yaml
  nginx:
    depends_on:
      - personal-website
      - code-quality-agent  # ADD THIS LINE
```

---

### 3. `/home/ec2-user/app/.env`

**ADD** this line:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## Deployment Commands

```bash
# 1. Build the image
cd /home/ec2-user/
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent
docker build -t code-quality-agent:latest .

# 2. Create data directory
cd /home/ec2-user/app/
mkdir -p code-quality-data/{reports,uploads,temp-repos}

# 3. Update files
# Edit nginx.conf (add location blocks)
# Edit docker-compose.yml (add service)
# Edit .env (add API key)

# 4. Test nginx config
docker exec nginx nginx -t

# 5. Deploy
docker-compose up -d

# 6. Check logs
docker-compose logs -f code-quality-agent

# 7. Verify
curl https://alextitov.com/code-quality-agent/
```

---

## That's It! 🎉

Your Code Quality Agent will be live at:
**https://alextitov.com/code-quality-agent/**
