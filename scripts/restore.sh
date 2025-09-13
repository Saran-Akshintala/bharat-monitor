#!/bin/bash

# Bharat Monitor Restore Script
# This script restores the MongoDB database from a backup

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup-file.tar.gz>"
    echo "📁 Available backups:"
    ls -la ./backups/bharat-monitor-backup-*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="./restore_temp"

echo "🔄 Starting restore process from: $BACKUP_FILE"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Create temporary restore directory
mkdir -p $RESTORE_DIR

# Extract backup
echo "📦 Extracting backup..."
tar -xzf $BACKUP_FILE -C $RESTORE_DIR

# Find the backup directory
BACKUP_DIR=$(find $RESTORE_DIR -name "bharat-monitor-backup-*" -type d | head -1)

if [ -z "$BACKUP_DIR" ]; then
    echo "❌ Invalid backup file structure"
    rm -rf $RESTORE_DIR
    exit 1
fi

# Stop application if running
echo "🛑 Stopping application..."
docker-compose down 2>/dev/null || true

# Start MongoDB
echo "🗄️  Starting MongoDB..."
docker-compose up -d mongodb

# Wait for MongoDB
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

until docker exec bharat-monitor-db mongosh --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
    echo "⏳ Waiting for MongoDB..."
    sleep 5
done

# Drop existing database
echo "🗑️  Dropping existing database..."
docker exec bharat-monitor-db mongosh --authenticationDatabase admin -u admin -p password123 --eval "db.getSiblingDB('bharat-monitor').dropDatabase()"

# Copy backup to container
echo "📋 Copying backup to MongoDB container..."
docker cp $BACKUP_DIR/bharat-monitor bharat-monitor-db:/tmp/

# Restore database
echo "🔄 Restoring database..."
docker exec bharat-monitor-db mongorestore --authenticationDatabase admin -u admin -p password123 --db bharat-monitor /tmp/bharat-monitor

# Restore configuration files if they exist
if [ -d "$BACKUP_DIR/config" ]; then
    echo "⚙️  Restoring configuration files..."
    cp $BACKUP_DIR/config/.env . 2>/dev/null || echo "⚠️  No .env file in backup"
    cp -r $BACKUP_DIR/config/nginx . 2>/dev/null || echo "⚠️  No nginx config in backup"
fi

# Cleanup
echo "🧹 Cleaning up temporary files..."
rm -rf $RESTORE_DIR

# Start application
echo "🚀 Starting application..."
docker-compose up -d

echo "✅ Restore completed successfully!"
echo "🔍 Performing health check..."

# Wait and check health
sleep 15
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    echo "⏳ Waiting for application... ($i/30)"
    sleep 2
done

echo "🎉 Restore process completed successfully!"
