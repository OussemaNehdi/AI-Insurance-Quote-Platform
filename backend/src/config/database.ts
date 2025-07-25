import mongoose from 'mongoose';
import { config } from '../config';

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Database URI: ${config.mongodb.uri.replace(/\/\/.*@/, '//***:***@')}`);
    
    const connectionOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, 
    };

    await mongoose.connect(config.mongodb.uri, connectionOptions);
    
    console.log('MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.db?.databaseName}`);
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    
    // Test the connection with a simple operation
    await testDatabaseConnection();
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('Make sure MongoDB is running on your system');
      } else if (error.message.includes('authentication failed')) {
        console.error('Check your MongoDB credentials in .env file');
      } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.error('Check your MongoDB URI in .env file');
      }
    }
    
    process.exit(1);
  }
};

// Test database connection with a simple operation
const testDatabaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.db?.admin().ping();
    console.log('Database ping successful');
  } catch (error) {
    console.warn('Database ping failed, but connection established');
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

// Check database connection status
export const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[mongoose.connection.readyState as keyof typeof states],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down...');
  await disconnectDatabase();
  process.exit(0);
});
