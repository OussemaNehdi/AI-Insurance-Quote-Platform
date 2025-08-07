// update-env.js
/**
 * Helper script to update environment variables
 * This script will create or update .env.local file with MongoDB settings
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to the .env.local file
const envFilePath = path.resolve(process.cwd(), '.env.local');

async function promptForConnectionType() {
  return new Promise((resolve) => {
    console.log(`${colors.bold}${colors.blue}MongoDB Connection Setup${colors.reset}`);
    console.log('='.repeat(50));
    console.log(`${colors.yellow}Select MongoDB connection type:${colors.reset}`);
    console.log(`1. Local MongoDB (mongodb://localhost:27017/insurance-ai)`);
    console.log(`2. Cloud MongoDB (custom connection string)`);
    
    rl.question(`Enter your choice (1/2): `, (answer) => {
      if (answer === '1') {
        resolve('local');
      } else if (answer === '2') {
        resolve('cloud');
      } else {
        console.log(`${colors.red}Invalid choice. Defaulting to local.${colors.reset}`);
        resolve('local');
      }
    });
  });
}

async function promptForCloudConnectionString() {
  return new Promise((resolve) => {
    rl.question(`Enter your MongoDB connection string: `, (connectionString) => {
      if (!connectionString) {
        console.log(`${colors.red}Invalid connection string. Using default.${colors.reset}`);
        resolve('mongodb://localhost:27017/insurance-ai');
      } else {
        resolve(connectionString);
      }
    });
  });
}

async function createEnvFile(connectionType, connectionString = '') {
  try {
    // Read existing .env.local if it exists
    let existingEnv = {};
    if (fs.existsSync(envFilePath)) {
      const content = fs.readFileSync(envFilePath, 'utf8');
      content.split('\n').forEach(line => {
        if (line.includes('=')) {
          const [key, value] = line.split('=');
          existingEnv[key.trim()] = value.trim();
        }
      });
      console.log(`${colors.yellow}Existing .env.local found. Updating MongoDB settings...${colors.reset}`);
    }
    
    // Set MongoDB variables based on connection type
    let envVars = {
      ...existingEnv,
      DATABASE_URL: connectionType === 'local' 
        ? 'mongodb://localhost:27017/insurance-ai' 
        : connectionString,
      MONGODB_SSL: connectionType === 'local' ? 'false' : 'true',
      MONGODB_TLS: connectionType === 'local' ? 'false' : 'true'
    };
    
    // Convert to string
    let envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Write to .env.local
    fs.writeFileSync(envFilePath, envContent);
    console.log(`${colors.green}✓ .env.local file updated successfully!${colors.reset}`);
    console.log(`${colors.bold}Settings:${colors.reset}`);
    console.log(`  DATABASE_URL=${envVars.DATABASE_URL}`);
    console.log(`  MONGODB_SSL=${envVars.MONGODB_SSL}`);
    console.log(`  MONGODB_TLS=${envVars.MONGODB_TLS}`);
    
  } catch (error) {
    console.error(`${colors.red}Error updating .env.local file:${colors.reset}`, error);
  }
}

async function main() {
  try {
    const connectionType = await promptForConnectionType();
    
    let connectionString = '';
    if (connectionType === 'cloud') {
      connectionString = await promptForCloudConnectionString();
    }
    
    await createEnvFile(connectionType, connectionString);
    console.log(`${colors.green}${colors.bold}MongoDB configuration updated successfully!${colors.reset}`);
    console.log(`${colors.yellow}Please restart your Next.js development server for changes to take effect.${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
  } finally {
    rl.close();
  }
}

main();
