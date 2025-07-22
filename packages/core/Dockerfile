
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY packages/core/package.json ./packages/core/

# Install dependencies
WORKDIR /app/packages/core
RUN npm ci

# Copy source code
COPY packages/core ./

# Build the package
RUN npm run build

# This container is used as a base for other services
CMD ["npm", "run", "build"]
