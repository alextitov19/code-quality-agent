# 🚀 Integration Instructions for Existing Infrastructure

## Prerequisites
1. Your EC2 instance with existing nginx and docker-compose setup
2. Code Quality Agent repository cloned
3. OpenAI API key

---

## Step-by-Step Integration

### 1️⃣ Prepare the Code Quality Agent Directory

On your EC2 instance:

```bash
# Navigate to your app directory (where your docker-compose.yml is)
cd /home/ec2-user/app/

# Clone the code quality agent
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent

# Build the Docker image
docker build -t code-quality-agent:latest .

# Create data directories
mkdir -p ../code-quality-data/{reports,uploads,temp-repos}
chmod 755 ../code-quality-data
```

### 2️⃣ Update Environment Variables

Create or update your `.env` file in `/home/ec2-user/app/`:

```bash
cd /home/ec2-user/app/
nano .env
```

Add this line:
```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3️⃣ Update docker-compose.yml

```bash
cd /home/ec2-user/app/
nano docker-compose.yml
```

Add the code-quality-agent service (see docker-compose-integration.yml for reference):

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
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Also update nginx dependencies:
```yaml
  nginx:
    depends_on:
      - personal-website
      - code-quality-agent  # ADD THIS LINE
```

### 4️⃣ Update nginx.conf

```bash
cd /home/ec2-user/app/
nano nginx.conf
```

Add these location blocks inside the HTTPS server block (after line 48, before the main "/" location):

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
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
            
            client_max_body_size 50M;
        }

        # Code Quality Agent - Static Reports
        location /code-quality-agent/reports {
            rewrite ^/code-quality-agent/reports/(.*) /reports/$1 break;
            proxy_pass http://code-quality-agent:3000;
            proxy_set_header Host $host;
            proxy_cache_valid 200 1h;
        }
```

### 5️⃣ Test nginx Configuration

```bash
# Test the nginx config (inside container)
docker exec nginx nginx -t

# If that doesn't work, copy your updated nginx.conf first:
docker cp nginx.conf nginx:/etc/nginx/nginx.conf
docker exec nginx nginx -t
```

### 6️⃣ Deploy

```bash
cd /home/ec2-user/app/

# Pull latest images (if needed)
docker-compose pull

# Start/restart all services
docker-compose up -d

# Check logs
docker-compose logs -f code-quality-agent
```

### 7️⃣ Verify Deployment

```bash
# Check container status
docker ps | grep code-quality-agent

# Test local connection
docker exec nginx curl -I http://code-quality-agent:3000/

# Test from outside
curl -I https://alextitov.com/code-quality-agent/
```

---

## Alternative: If Docker Compose is in a Different Location

If your docker-compose.yml is elsewhere, you can run the code-quality-agent separately:

```bash
cd /home/ec2-user/code-quality-agent/

# Create .env file here
cat > .env << EOF
OPENAI_API_KEY=your-key-here
NODE_ENV=production
PORT=3000
EOF

# Run standalone
docker run -d \
  --name code-quality-agent \
  --network app_webnet \
  --restart unless-stopped \
  -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -v "$(pwd)/data/reports:/app/reports" \
  -v "$(pwd)/data/uploads:/app/uploads" \
  -v "$(pwd)/data/temp-repos:/app/temp-repos" \
  code-quality-agent:latest

# Then update nginx and restart it
docker restart nginx
```

---

## Troubleshooting

### Container not starting?
```bash
docker logs code-quality-agent
docker inspect code-quality-agent
```

### Nginx can't connect?
```bash
# Check network
docker network inspect app_webnet

# Test connectivity
docker exec nginx ping code-quality-agent
docker exec nginx curl http://code-quality-agent:3000/
```

### 404 or 502 errors?
```bash
# Check nginx config
docker exec nginx nginx -t

# Restart nginx
docker restart nginx

# Check logs
docker logs nginx
```

### Permission issues with volumes?
```bash
sudo chown -R 1001:1001 /home/ec2-user/app/code-quality-data/
```

---

## Maintenance

### View logs
```bash
docker logs -f code-quality-agent
```

### Restart service
```bash
docker-compose restart code-quality-agent
```

### Update application
```bash
cd /home/ec2-user/code-quality-agent/
git pull
docker build -t code-quality-agent:latest .
docker-compose up -d --force-recreate code-quality-agent
```

### Clean up old data
```bash
# Clean old reports (7+ days)
find /home/ec2-user/app/code-quality-data/reports -name "*.html" -mtime +7 -delete

# Clean temp repos
rm -rf /home/ec2-user/app/code-quality-data/temp-repos/*
```

---

## Access URLs

- **Main App**: https://alextitov.com/code-quality-agent/
- **Reports**: https://alextitov.com/code-quality-agent/reports/
- **API Health**: https://alextitov.com/code-quality-agent/

---

## Directory Structure

```
/home/ec2-user/
├── app/
│   ├── docker-compose.yml         (updated)
│   ├── nginx.conf                 (updated)
│   ├── .env                       (add OPENAI_API_KEY)
│   └── code-quality-data/         (created)
│       ├── reports/
│       ├── uploads/
│       └── temp-repos/
├── code-quality-agent/            (cloned repo)
│   ├── Dockerfile
│   └── ... (source code)
└── certs/
    └── ... (SSL certificates)
```

---

## Quick Commands Reference

```bash
# Start all services
cd /home/ec2-user/app/ && docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f code-quality-agent

# Restart service
docker-compose restart code-quality-agent

# Stop service
docker-compose stop code-quality-agent

# Remove service
docker-compose down code-quality-agent

# Rebuild and restart
cd /home/ec2-user/code-quality-agent/ && \
  docker build -t code-quality-agent:latest . && \
  cd /home/ec2-user/app/ && \
  docker-compose up -d --force-recreate code-quality-agent
```

---

**Ready to go!** 🚀

After following these steps, your Code Quality Agent will be accessible at:
**https://alextitov.com/code-quality-agent/**
