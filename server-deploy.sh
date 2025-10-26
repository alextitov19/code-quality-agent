#!/bin/bash

# Simple deployment - just restart with docker-compose

set -e

echo "🚀 Deploying Code Quality Agent"
echo ""

# Check environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY is not set"
    echo "Please set it: export OPENAI_API_KEY='your-key-here'"
    exit 1
fi

echo "✅ OPENAI_API_KEY is set"
echo ""

# Deploy with docker-compose
echo "🔄 Starting services with docker-compose..."
docker-compose -f docker-compose-integration.yml up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker logs -f code-quality-agent"
echo "  - Restart: docker-compose -f docker-compose-integration.yml restart code-quality-agent"
echo "  - Stop: docker-compose -f docker-compose-integration.yml down"
echo ""
