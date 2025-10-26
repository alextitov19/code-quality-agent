#!/bin/bash

# Build and Deploy Script for Code Quality Agent
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment of Code Quality Agent..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found. Please create it with your OPENAI_API_KEY.${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY is not set in .env file.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment variables loaded"

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p data/reports data/uploads data/temp-repos
chmod 755 data
echo -e "${GREEN}✓${NC} Directories created"

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t code-quality-agent:latest . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} Docker image built successfully"

# Stop existing container if running
echo "🛑 Stopping existing container (if any)..."
docker stop code-quality-agent 2>/dev/null || true
docker rm code-quality-agent 2>/dev/null || true
echo -e "${GREEN}✓${NC} Old container removed"

# Start new container
echo "🚀 Starting new container..."
docker run -d \
    --name code-quality-agent \
    --restart unless-stopped \
    -p 3000:3000 \
    -e OPENAI_API_KEY="$OPENAI_API_KEY" \
    -e NODE_ENV=production \
    -e PORT=3000 \
    -v "$(pwd)/data/reports:/app/reports" \
    -v "$(pwd)/data/uploads:/app/uploads" \
    -v "$(pwd)/data/temp-repos:/app/temp-repos" \
    code-quality-agent:latest || {
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
}

echo -e "${GREEN}✓${NC} Container started successfully"

# Wait for container to be healthy
echo "⏳ Waiting for application to be ready..."
sleep 5

# Check if container is running
if docker ps | grep -q code-quality-agent; then
    echo -e "${GREEN}✓${NC} Container is running"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo "Logs:"
    docker logs code-quality-agent
    exit 1
fi

# Test the endpoint
echo "🧪 Testing application endpoint..."
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Application is responding"
else
    echo -e "${YELLOW}⚠${NC}  Application might still be starting up..."
fi

# Display status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Container Status:"
docker ps | grep code-quality-agent || echo "Not found"
echo ""
echo "🌐 Access URLs:"
echo "  Local:  http://localhost:3000/"
echo "  Domain: https://alextitov.com/code-quality-agent/"
echo ""
echo "📝 Useful Commands:"
echo "  View logs:    docker logs -f code-quality-agent"
echo "  Stop:         docker stop code-quality-agent"
echo "  Restart:      docker restart code-quality-agent"
echo "  Stats:        docker stats code-quality-agent"
echo ""
echo "🔧 Next Steps:"
echo "  1. Configure nginx reverse proxy (see DEPLOYMENT.md)"
echo "  2. Set up SSL certificate with certbot"
echo "  3. Test the application"
echo ""
