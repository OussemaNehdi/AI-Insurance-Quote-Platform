import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_platform',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_change_this',
    expiresIn: process.env.JWT_EXPIRE || '30d',
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Security Configuration
  security: {
    bcryptRounds: 12,
  }
};

// Validate required environment variables
export const validateConfig = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  if (config.nodeEnv === 'production') {
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  console.log('Configuration validated successfully');
};
