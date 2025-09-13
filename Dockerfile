# Multi-stage build for production
FROM node:18-alpine AS backend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Frontend build stage
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/angular.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy frontend source
COPY frontend/src ./src

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built backend
COPY --from=backend-builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=backend-builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nestjs:nodejs /app/package*.json ./

# Copy built frontend
COPY --from=frontend-builder --chown=nestjs:nodejs /app/frontend/dist ./public

# Copy environment file
COPY --chown=nestjs:nodejs .env.example ./.env

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/main.js"]
