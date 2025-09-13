#!/bin/bash

# Bharat Monitor Development Setup Script
# This script sets up the development environment

set -e

echo "🛠️  Setting up Bharat Monitor development environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start MongoDB for development
echo "🗄️  Starting MongoDB for development..."
docker-compose -f docker-compose.dev.yml up -d mongodb

# Wait for MongoDB
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

until docker exec bharat-monitor-db-dev mongosh --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
    echo "⏳ Waiting for MongoDB..."
    sleep 5
done

echo "✅ MongoDB is ready!"

# Run database initialization
echo "🌱 Initializing database..."
docker-compose -f docker-compose.dev.yml exec -T mongodb mongosh bharat-monitor --authenticationDatabase admin -u admin -p password123 < scripts/mongo-init.js

# Seed database
echo "🌱 Seeding database with demo data..."
npm run seed

echo "🎉 Development environment setup completed!"
echo ""
echo "🚀 To start development:"
echo "   Backend: npm run start:dev"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "📊 Development URLs:"
echo "   - Backend API: http://localhost:3000"
echo "   - Frontend: http://localhost:4200"
echo "   - API Docs: http://localhost:3000/api/docs"
echo ""
echo "🔧 Useful commands:"
echo "   - Stop MongoDB: docker-compose -f docker-compose.dev.yml down"
echo "   - View MongoDB logs: docker-compose -f docker-compose.dev.yml logs mongodb"
echo "   - Reset database: docker-compose -f docker-compose.dev.yml down -v"
