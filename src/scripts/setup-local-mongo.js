// setup-local-mongo.js
/**
 * Helper script to set up a local MongoDB instance for testing
 * Run this script with Node.js to check local MongoDB availability
 * and set up initial database structure
 */

const { MongoClient } = require('mongodb');
const localUri = 'mongodb://localhost:27017/insurance-ai';

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

async function checkLocalMongo() {
  console.log(`${colors.bold}${colors.blue}Insurance AI - Local MongoDB Setup${colors.reset}`);
  console.log('='.repeat(50));
  console.log(`${colors.yellow}Checking local MongoDB availability at: ${localUri}${colors.reset}`);
  
  const client = new MongoClient(localUri, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
  
  try {
    await client.connect();
    console.log(`${colors.green}✓ Successfully connected to local MongoDB${colors.reset}`);
    
    // Check if database exists, if not create it
    const db = client.db('insurance-ai');
    console.log(`${colors.blue}Using database: insurance-ai${colors.reset}`);
    
    // Create necessary collections if they don't exist
    const collections = ['users', 'companies', 'insurance_quotes'];
    
    for (const collection of collections) {
      const exists = await db.listCollections({ name: collection }).hasNext();
      
      if (!exists) {
        await db.createCollection(collection);
        console.log(`${colors.green}✓ Created collection: ${collection}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}✓ Collection already exists: ${collection}${colors.reset}`);
      }
    }
    
    // Check if we have any users
    const userCount = await db.collection('users').countDocuments();
    console.log(`${colors.blue}Found ${userCount} users in the database${colors.reset}`);
    
    // Create admin user if no users exist
    if (userCount === 0) {
      console.log(`${colors.yellow}No users found. Creating default admin user...${colors.reset}`);
      await db.collection('users').insertOne({
        email: 'admin@insurance-ai.local',
        password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', // "password"
        role: 'admin',
        createdAt: new Date()
      });
      console.log(`${colors.green}✓ Created default admin user:${colors.reset}`);
      console.log(`   Email: admin@insurance-ai.local`);
      console.log(`   Password: password`);
    }
    
    console.log('='.repeat(50));
    console.log(`${colors.green}${colors.bold}Local MongoDB is ready to use!${colors.reset}`);
    console.log(`${colors.yellow}You can now update your .env file with:${colors.reset}`);
    console.log(`DATABASE_URL=mongodb://localhost:27017/insurance-ai`);
    console.log(`MONGODB_SSL=false`);
    console.log(`MONGODB_TLS=false`);
    
  } catch (error) {
    console.error(`${colors.red}Error connecting to local MongoDB:${colors.reset}`, error.message);
    console.log(`${colors.yellow}Please make sure MongoDB is installed and running on your machine.${colors.reset}`);
    console.log(`${colors.yellow}Installation guide:${colors.reset} https://www.mongodb.com/docs/manual/installation/`);
  } finally {
    await client.close();
  }
}

checkLocalMongo().catch(console.error);
