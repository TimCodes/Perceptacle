
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/

# Install dependencies
RUN npm ci

# Copy client source
COPY packages/client ./packages/client
COPY components.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Build the client
WORKDIR /app/packages/client
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY packages/client/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
