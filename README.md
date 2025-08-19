# Perceptacle - Separated Client/Server Architecture

This project has been restructured as a monorepo with separated client and server applications.

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/               # Client source code
│   ├── package.json       # Client dependencies
│   └── ...
├── server/                # Express backend API
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── package.json      # Server dependencies
│   └── ...
└── package.json          # Root monorepo scripts
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm

### Getting Started

1. **Install dependencies** for both client and server:
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies  
   cd ../client && npm install
   ```

2. **Development mode** (runs both client and server):
   ```bash
   npm run dev
   ```

   This starts:
   - Server API on `http://localhost:5000`
   - Client dev server on `http://localhost:5173`

3. **Run individually**:
   ```bash
   # Server only
   npm run dev:server
   
   # Client only
   npm run dev:client
   ```

## Production Build

```bash
# Build both
npm run build

# Build individually
npm run build:client
npm run build:server
```

## Environment Configuration

### Server (.env)
Copy `server/.env.example` to `server/.env` and configure:
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Client URL for CORS (default: http://localhost:5173)
- Database and API configurations

### Client
The client will connect to the API server. Update the API base URL in your client configuration if needed.

## Key Changes

- **Separated concerns**: Client and server now have independent package.json files
- **CORS enabled**: Server configured to accept requests from client
- **No client serving**: Server is now a pure API server
- **Independent deployment**: Client and server can be deployed separately
- **Development workflow**: Both can run simultaneously with hot reloading

## Database

Database operations are handled in the server:
```bash
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

## Testing

```bash
npm run test        # Run all tests
npm run test:server # Server tests only
npm run test:client # Client tests only
```
