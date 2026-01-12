import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

describe('Server Setup', () => {
  let app: Express;

  beforeEach(() => {
    // Create a minimal app that mimics the main server setup
    app = express();

    // CORS configuration
    app.use(cors({
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5174"
      ],
      credentials: true
    }));

    // Body parsing middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Simple logging function
    function log(message: string, source = "express") {
      const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      console.log(`${formattedTime} [${source}] ${message}`);
    }

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          log(logLine);
        }
      });

      next();
    });

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'synapse-server' 
      });
    });

    // Test API endpoint
    app.get('/api/test', (_req: Request, res: Response) => {
      res.json({ message: 'Test endpoint' });
    });

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 status for /health endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('synapse-server');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return timestamp in ISO format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
    });
  });

  describe('CORS Configuration', () => {
    it('should allow requests from default localhost port', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should allow requests from alternative port', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5174')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5174');
    });

    it('should include credentials in CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Body Parsing Middleware', () => {
    it('should parse JSON request bodies', async () => {
      app.post('/api/test', (req: Request, res: Response) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/api/test')
        .send({ name: 'test', value: 123 })
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body.received).toEqual({ name: 'test', value: 123 });
    });

    it('should parse URL-encoded request bodies', async () => {
      app.post('/api/test-form', (req: Request, res: Response) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/api/test-form')
        .send('name=test&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(200);

      expect(response.body.received).toEqual({ name: 'test', value: '123' });
    });
  });

  describe('Logging Middleware', () => {
    it('should log API requests', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .get('/api/test')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls.find(call => 
        call[0].includes('GET /api/test')
      );
      expect(logCall).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should not log non-API requests', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .get('/health')
        .expect(200);

      const logCall = consoleSpy.mock.calls.find(call => 
        call[0].includes('GET /health')
      );
      expect(logCall).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should include status code in log', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .get('/api/test')
        .expect(200);

      const logCall = consoleSpy.mock.calls.find(call => 
        call[0].includes('200')
      );
      expect(logCall).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle errors with status codes', async () => {
      // Create new app for this test
      const testApp = express();
      testApp.use(express.json());

      testApp.get('/api/error', (_req: Request, _res: Response, next: NextFunction) => {
        const error: any = new Error('Test error');
        error.status = 400;
        next(error);
      });

      testApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });

      const response = await request(testApp)
        .get('/api/error')
        .expect(400);

      expect(response.body.message).toBe('Test error');
    });

    it('should default to 500 status for errors without status', async () => {
      // Create new app for this test
      const testApp = express();
      testApp.use(express.json());

      testApp.get('/api/error-500', (_req: Request, _res: Response, next: NextFunction) => {
        next(new Error('Internal error'));
      });

      testApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });

      const response = await request(testApp)
        .get('/api/error-500')
        .expect(500);

      expect(response.body.message).toBe('Internal error');
    });
  });

  describe('Response Format', () => {
    it('should return JSON responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(typeof response.body).toBe('object');
    });

    it('should handle JSON response in API endpoints', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ message: 'Test endpoint' });
    });
  });

  describe('Request Methods', () => {
    beforeEach(() => {
      app.post('/api/test', (req: Request, res: Response) => {
        res.json({ method: 'POST', body: req.body });
      });

      app.put('/api/test', (req: Request, res: Response) => {
        res.json({ method: 'PUT', body: req.body });
      });

      app.delete('/api/test', (req: Request, res: Response) => {
        res.json({ method: 'DELETE' });
      });
    });

    it('should handle GET requests', async () => {
      await request(app)
        .get('/api/test')
        .expect(200);
    });

    it('should handle POST requests', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body.method).toBe('POST');
    });

    it('should handle PUT requests', async () => {
      const response = await request(app)
        .put('/api/test')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body.method).toBe('PUT');
    });

    it('should handle DELETE requests', async () => {
      const response = await request(app)
        .delete('/api/test')
        .expect(200);

      expect(response.body.method).toBe('DELETE');
    });
  });
});
