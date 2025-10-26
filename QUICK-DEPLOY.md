# 🚀 Quick Deployment Reference

## Initial Setup on EC2

```bash
# 1. Clone repository
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent

# 2. Create .env file
cat > .env << EOF
OPENAI_API_KEY=your-api-key-here
NODE_ENV=production
PORT=3000
EOF

# 3. Create data directories
mkdir -p data/{reports,uploads,temp-repos}
chmod 755 data

# 4. Make deploy script executable
chmod +x deploy.sh
```

## Deployment

### Option 1: Using Deploy Script (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual Docker Commands
```bash
# Build image
docker build -t code-quality-agent:latest .

# Run container
docker run -d \
  --name code-quality-agent \
  --restart unless-stopped \
  -p 3000:3000 \
  -e OPENAI_API_KEY="your-key" \
  -v $(pwd)/data/reports:/app/reports \
  -v $(pwd)/data/uploads:/app/uploads \
  -v $(pwd)/data/temp-repos:/app/temp-repos \
  code-quality-agent:latest
```

### Option 3: Using Docker Compose
```bash
# Add service to your docker-compose.yml
# Then run:
docker-compose up -d code-quality-agent
```

## Nginx Configuration

Add to `/etc/nginx/sites-available/alextitov.com`:

```nginx
location /code-quality-agent {
    rewrite ^/code-quality-agent/(.*) /$1 break;
    rewrite ^/code-quality-agent$ / break;
    
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    client_max_body_size 50M;
    proxy_connect_timeout 60s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
}
```

Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Common Commands

### Container Management
```bash
# View logs
docker logs -f code-quality-agent

# View last 100 lines
docker logs --tail 100 code-quality-agent

# Restart container
docker restart code-quality-agent

# Stop container
docker stop code-quality-agent

# Remove container
docker rm code-quality-agent

# View stats
docker stats code-quality-agent
```

### Updates
```bash
# Pull latest changes
git pull

# Rebuild and restart
./deploy.sh

# Or manually:
docker build -t code-quality-agent:latest .
docker stop code-quality-agent
docker rm code-quality-agent
# Then run docker run command again
```

### Maintenance
```bash
# Clean old reports (7+ days)
find data/reports -name "*.html" -mtime +7 -delete

# Clean temp repos
rm -rf data/temp-repos/*

# Clean Docker system
docker system prune -a

# Backup reports
tar -czf reports-backup-$(date +%Y%m%d).tar.gz data/reports/
```

### Troubleshooting
```bash
# Check container status
docker ps | grep code-quality-agent

# Check if app responds
curl http://localhost:3000/

# Check via domain
curl https://alextitov.com/code-quality-agent/

# Enter container shell
docker exec -it code-quality-agent sh

# View environment variables
docker exec code-quality-agent env

# Check disk usage
du -sh data/*
df -h
```

### Health Checks
```bash
# Local health check
curl http://localhost:3000/

# Domain health check
curl https://alextitov.com/code-quality-agent/

# Docker health status
docker inspect --format='{{.State.Health.Status}}' code-quality-agent
```

## URLs

- **Local**: http://localhost:3000/
- **Production**: https://alextitov.com/code-quality-agent/
- **Reports**: https://alextitov.com/code-quality-agent/reports/

## Port Mapping

- Container Port: `3000`
- Host Port: `3000`
- Nginx Proxy: `alextitov.com/code-quality-agent` → `localhost:3000`

## Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key
- `NODE_ENV` - Set to `production`
- `PORT` - Application port (default: 3000)

## Data Volumes

- `./data/reports` → `/app/reports` - Generated analysis reports
- `./data/uploads` → `/app/uploads` - Temporary file uploads
- `./data/temp-repos` → `/app/temp-repos` - Cloned GitHub repositories

## Security Checklist

- [ ] `.env` file is not committed to git
- [ ] SSL certificate is configured (Let's Encrypt)
- [ ] Firewall rules are set (only ports 80, 443, 22)
- [ ] Container runs as non-root user (nodejs:nodejs)
- [ ] Regular backups are scheduled
- [ ] Log rotation is configured
- [ ] Disk space monitoring is set up
