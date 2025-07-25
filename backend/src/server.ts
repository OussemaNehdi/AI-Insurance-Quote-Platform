import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { config, validateConfig } from './config';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import { ApiResponse } from './types';

class Server {
  private app: Application;
  
  constructor() {
    this.app = express();
    this.validateEnvironment();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }
  
  private validateEnvironment(): void {
    try {
      validateConfig();
    } catch (error) {
      console.error('Configuration validation failed:', error);
      process.exit(1);
    }
  }
  
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Compression middleware
    this.app.use(compression());
    
    // Logging middleware
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
  }
  
  private initializeRoutes(): void {
    this.app.get('/test', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Insurance Platform Backend ',
        availableRoutes: [
          'POST /api/auth/register - Register a company',
          'POST /api/auth/login - Login a company',
          'GET /api/auth/profile - Get company profile (authenticated)',
          'PUT /api/auth/profile - Update company profile (authenticated)'
        ]
      });
    });
    
    // API routes
    this.app.use('/api/auth', authRoutes);
    
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      const response: ApiResponse = {
        success: false,
        error: `Route ${req.originalUrl} not found`
      };
      res.status(404).json(response);
    });
  }
  
  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: any) => {
      console.error('Unhandled error:', error);
      
      const response: ApiResponse = {
        success: false,
        error: config.nodeEnv === 'development' 
          ? error.message 
          : 'Internal server error'
      };
      
      res.status(500).json(response);
    });
  }
  
  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      
      // Start server
      this.app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);

        
        if (config.nodeEnv === 'development') {
          console.log(`API Base URL: http://localhost:${config.port}`);
          console.log(`Auth Routes: http://localhost:${config.port}/api/auth`);
        }
      });
      
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;
