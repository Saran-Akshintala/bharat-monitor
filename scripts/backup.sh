#!/bin/bash

# Bharat Monitor Backup Script
# This script creates backups of the MongoDB database and application data

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="bharat-monitor-backup-$DATE"

echo "💾 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "🗄️  Backing up MongoDB database..."
docker exec bharat-monitor-db mongodump --authenticationDatabase admin -u admin -p password123 --db bharat-monitor --out /tmp/backup

# Copy backup from container
docker cp bharat-monitor-db:/tmp/backup $BACKUP_DIR/$BACKUP_NAME

# Backup configuration files
echo "📁 Backing up configuration files..."
mkdir -p $BACKUP_DIR/$BACKUP_NAME/config
cp .env $BACKUP_DIR/$BACKUP_NAME/config/ 2>/dev/null || echo "⚠️  .env file not found"
cp docker-compose.yml $BACKUP_DIR/$BACKUP_NAME/config/
cp -r nginx $BACKUP_DIR/$BACKUP_NAME/config/ 2>/dev/null || echo "⚠️  nginx directory not found"

# Create archive
echo "📦 Creating backup archive..."
cd $BACKUP_DIR
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME
cd ..

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "bharat-monitor-backup-*.tar.gz" -mtime +7 -delete

echo "🎉 Backup process completed successfully!"
