
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/core ./packages/core
COPY packages/server ./packages/server

# Build core package
RUN npm run build --workspace=@github-manager/core

# Build server
RUN npm run build --workspace=@github-manager/server

WORKDIR /app/packages/server

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "run", "start"]
