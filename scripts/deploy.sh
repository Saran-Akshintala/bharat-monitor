#!/bin/bash

# Bharat Monitor Deployment Script
# This script builds and deploys the application using Docker

set -e

echo "🚀 Starting Bharat Monitor deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env file with your configuration before running again."
    exit 1
fi

# Load environment variables
source .env

# Build and start services
echo "🔨 Building Docker images..."
docker-compose down --remove-orphans
docker-compose build --no-cache

echo "🗄️  Starting MongoDB..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Check if MongoDB is ready
until docker exec bharat-monitor-db mongosh --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
    echo "⏳ Waiting for MongoDB..."
    sleep 5
done

echo "✅ MongoDB is ready!"

# Run database initialization
echo "🌱 Initializing database..."
docker-compose exec -T mongodb mongosh bharat-monitor --authenticationDatabase admin -u admin -p password123 < scripts/mongo-init.js

# Start the application
echo "🚀 Starting application..."
docker-compose up -d app

# Wait for application to be ready
echo "⏳ Waiting for application to start..."
sleep 15

# Health check
echo "🔍 Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    echo "⏳ Waiting for application... ($i/30)"
    sleep 2
done

# Start Nginx (optional)
if [ "${ENABLE_NGINX:-false}" = "true" ]; then
    echo "🌐 Starting Nginx reverse proxy..."
    docker-compose up -d nginx
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Application URLs:"
echo "   - API: http://localhost:3000"
echo "   - Health Check: http://localhost:3000/api/health"
echo "   - API Documentation: http://localhost:3000/api/docs"
if [ "${ENABLE_NGINX:-false}" = "true" ]; then
    echo "   - Web Interface: http://localhost"
fi
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env file with your API keys"
echo "   2. Create admin user: npm run seed"
echo "   3. Access the application and start monitoring!"
