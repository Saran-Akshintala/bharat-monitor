// MongoDB initialization script for Docker
db = db.getSiblingDB('bharat-monitor');

// Create collections with indexes for better performance
db.createCollection('users');
db.createCollection('monitors');
db.createCollection('monitorlogs');
db.createCollection('alerts');

// Create indexes for better query performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.monitors.createIndex({ "userId": 1 });
db.monitors.createIndex({ "isActive": 1 });
db.monitors.createIndex({ "lastCheckedAt": 1 });
db.monitorlogs.createIndex({ "monitorId": 1 });
db.monitorlogs.createIndex({ "checkedAt": -1 });
db.alerts.createIndex({ "userId": 1 });
db.alerts.createIndex({ "monitorId": 1 });
db.alerts.createIndex({ "triggeredAt": -1 });

print('Database initialized successfully!');
