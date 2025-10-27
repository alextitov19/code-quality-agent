# Deployment Guide

## Quick Deployment with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key
- (Optional) GitHub Personal Access Token for higher rate limits

### Steps

1. **Set environment variables:**
```bash
export OPENAI_API_KEY='your-openai-api-key'
export GITHUB_TOKEN='your-github-token'  # Optional
```

2. **Deploy:**
```bash
docker-compose -f docker-compose-integration.yml up -d
```

3. **View logs:**
```bash
docker logs -f code-quality-agent
```

4. **Access the application:**
- Local: `http://localhost:3000`
- Production: `https://alextitov.com/code-quality-agent`

### Updating to Latest Version

1. **Build and push new version locally:**
```bash
./upload.sh
```

2. **On server, pull and restart:**
```bash
docker-compose -f docker-compose-integration.yml pull code-quality-agent
docker-compose -f docker-compose-integration.yml up -d
```

### Useful Commands

```bash
# Stop service
docker-compose -f docker-compose-integration.yml down

# Restart service
docker-compose -f docker-compose-integration.yml restart code-quality-agent

# Check status
docker ps | grep code-quality-agent

# View logs
docker logs -f code-quality-agent
```

## Nginx Configuration

The `nginx-integration.conf` file contains the full nginx setup. Key points:

- Service exposed at `/code-quality-agent` path
- Supports file uploads up to 50MB
- Extended timeouts for GitHub repository cloning (300s)
- Automatic HTTPS with Let's Encrypt certificates

After updating nginx config:
```bash
sudo nginx -t
sudo systemctl reload nginx
```
