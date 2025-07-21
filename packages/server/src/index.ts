
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createSuccessResponse } from '@github-manager/core';
import { diagramRoutes } from './routes/diagrams.js';
import { nodeTypeRoutes } from './routes/node-types.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json(createSuccessResponse({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'github-manager-server'
  }));
});

// API routes
app.use('/api/diagrams', diagramRoutes);
app.use('/api/node-types', nodeTypeRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
