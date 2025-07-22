
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/client/package.json ./packages/client/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/core ./packages/core
COPY packages/client ./packages/client

# Build core package first
RUN npm run build --workspace=@github-manager/core

# Build client
RUN npm run build --workspace=@github-manager/client

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
