// This file contains sample data for initializing the database
// Run with: node scripts/init-db.js

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const URI = process.env.DATABASE_URL;
if (!URI) {
  console.error('Please add your MongoDB connection string to .env file');
  process.exit(1);
}

// Sample insurance companies with their configurations
const companies = [
  {
    companyName: "Secure Insurance Co.",
    email: "contact@secureinsurance.example",
    website: "https://secureinsurance.example",
    phone: "+1-555-123-4567",
    address: "123 Secure St, Insuranceville, IN 12345",
    insuranceTypes: [
      {
        type: "Auto",
        displayName: "Auto Insurance",
        basePrice: 500,
        fields: [
          {
            name: "country",
            label: "Country",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "USA", multiplier: 1.0 },
              { value: "Canada", multiplier: 0.9 },
              { value: "UK", multiplier: 1.2 },
              { value: "Australia", multiplier: 1.3 },
              { value: "Germany", multiplier: 1.1 }
            ]
          },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "Male", multiplier: 1.1 },
              { value: "Female", multiplier: 0.9 },
              { value: "Non-Binary", multiplier: 1.0 },
              { value: "Prefer not to say", multiplier: 1.0 }
            ]
          }
        ]
      },
      {
        type: "Home",
        displayName: "Home Insurance",
        basePrice: 800,
        fields: [
          {
            name: "country",
            label: "Country",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "USA", multiplier: 1.0 },
              { value: "Canada", multiplier: 0.95 },
              { value: "UK", multiplier: 1.1 },
              { value: "Australia", multiplier: 1.2 },
              { value: "Germany", multiplier: 1.05 }
            ]
          },
          {
            name: "city",
            label: "City Type",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "Rural", multiplier: 0.8 },
              { value: "Suburban", multiplier: 1.0 },
              { value: "Urban", multiplier: 1.3 },
              { value: "Metropolitan", multiplier: 1.5 }
            ]
          }
        ]
      }
    ]
  },
  {
    companyName: "Guardian Insurance",
    email: "info@guardianinsurance.example",
    website: "https://guardianinsurance.example",
    phone: "+1-555-987-6543",
    address: "456 Guardian Ave, Safetyville, SF 67890",
    insuranceTypes: [
      {
        type: "Health",
        displayName: "Health Insurance",
        basePrice: 300,
        fields: [
          {
            name: "country",
            label: "Country",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "USA", multiplier: 1.5 },
              { value: "Canada", multiplier: 0.7 },
              { value: "UK", multiplier: 0.6 },
              { value: "Australia", multiplier: 0.8 },
              { value: "Germany", multiplier: 0.75 }
            ]
          },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "Male", multiplier: 0.9 },
              { value: "Female", multiplier: 1.1 },
              { value: "Non-Binary", multiplier: 1.0 },
              { value: "Prefer not to say", multiplier: 1.0 }
            ]
          }
        ]
      },
      {
        type: "Life",
        displayName: "Life Insurance",
        basePrice: 200,
        fields: [
          {
            name: "country",
            label: "Country",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "USA", multiplier: 1.2 },
              { value: "Canada", multiplier: 1.0 },
              { value: "UK", multiplier: 1.1 },
              { value: "Australia", multiplier: 1.1 },
              { value: "Germany", multiplier: 1.0 }
            ]
          },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "Male", multiplier: 1.1 },
              { value: "Female", multiplier: 0.9 },
              { value: "Non-Binary", multiplier: 1.0 },
              { value: "Prefer not to say", multiplier: 1.0 }
            ]
          }
        ]
      }
    ]
  },
  {
    companyName: "Protecto Insurance Ltd.",
    email: "service@protectoinsurance.example",
    website: "https://protecto.example",
    phone: "+1-555-456-7890",
    address: "789 Shield Blvd, Coverageton, CV 54321",
    insuranceTypes: [
      {
        type: "Auto",
        displayName: "Premium Auto Coverage",
        basePrice: 600,
        fields: [
          {
            name: "country",
            label: "Country",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "USA", multiplier: 1.0 },
              { value: "Canada", multiplier: 0.95 },
              { value: "UK", multiplier: 1.15 },
              { value: "Australia", multiplier: 1.25 },
              { value: "Germany", multiplier: 1.1 }
            ]
          },
          {
            name: "city",
            label: "City Type",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "Rural", multiplier: 0.85 },
              { value: "Suburban", multiplier: 1.0 },
              { value: "Urban", multiplier: 1.25 },
              { value: "Metropolitan", multiplier: 1.4 }
            ]
          }
        ]
      },
      {
        type: "Home",
        displayName: "Home Shield Insurance",
        basePrice: 750,
        fields: [
          {
            name: "country",
            label: "Country",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "USA", multiplier: 1.0 },
              { value: "Canada", multiplier: 0.9 },
              { value: "UK", multiplier: 1.1 },
              { value: "Australia", multiplier: 1.2 },
              { value: "Germany", multiplier: 1.05 }
            ]
          },
          {
            name: "city",
            label: "City Type",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "Rural", multiplier: 0.75 },
              { value: "Suburban", multiplier: 1.0 },
              { value: "Urban", multiplier: 1.35 },
              { value: "Metropolitan", multiplier: 1.6 }
            ]
          }
        ]
      },
      {
        type: "Health",
        displayName: "Health Shield Plus",
        basePrice: 350,
        fields: [
          {
            name: "country",
            label: "Country",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "USA", multiplier: 1.6 },
              { value: "Canada", multiplier: 0.65 },
              { value: "UK", multiplier: 0.55 },
              { value: "Australia", multiplier: 0.75 },
              { value: "Germany", multiplier: 0.7 }
            ]
          },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            fallbackMultiplier: 1.0,
            options: [
              { value: "Male", multiplier: 0.95 },
              { value: "Female", multiplier: 1.05 },
              { value: "Non-Binary", multiplier: 1.0 },
              { value: "Prefer not to say", multiplier: 1.0 }
            ]
          }
        ]
      }
    ]
  }
];

// Sample user for testing
const users = [
  {
    email: "admin@insurance-ai.example",
    password: "$2a$10$XCZq/N5CgMZ7TUgpHQx5e.QOU0B7M1gg3yHbFXZyOdXEQ5ZK7mJEC", // Password: admin123
    role: "admin",
    createdAt: new Date()
  },
  {
    email: "secure@insurance-ai.example",
    password: "$2a$10$XCZq/N5CgMZ7TUgpHQx5e.QOU0B7M1gg3yHbFXZyOdXEQ5ZK7mJEC", // Password: admin123
    role: "company",
    createdAt: new Date()
  },
  {
    email: "guardian@insurance-ai.example",
    password: "$2a$10$XCZq/N5CgMZ7TUgpHQx5e.QOU0B7M1gg3yHbFXZyOdXEQ5ZK7mJEC", // Password: admin123
    role: "company",
    createdAt: new Date()
  },
  {
    email: "protecto@insurance-ai.example",
    password: "$2a$10$XCZq/N5CgMZ7TUgpHQx5e.QOU0B7M1gg3yHbFXZyOdXEQ5ZK7mJEC", // Password: admin123
    role: "company",
    createdAt: new Date()
  }
];

async function initializeDatabase() {
  const client = new MongoClient(URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('insurance-ai');
    
    // Drop existing collections
    console.log('Dropping existing collections...');
    await db.collection('users').drop().catch(() => console.log('No users collection to drop'));
    await db.collection('companies').drop().catch(() => console.log('No companies collection to drop'));
    
    // Insert sample data
    console.log('Inserting sample companies...');
    const companyResults = await db.collection('companies').insertMany(companies);
    const companyIds = Object.values(companyResults.insertedIds);
    
    // Assign company IDs to users
    users[1].companyId = companyIds[0].toString();
    users[2].companyId = companyIds[1].toString();
    users[3].companyId = companyIds[2].toString();
    
    console.log('Inserting sample users...');
    await db.collection('users').insertMany(users);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
  }
}

initializeDatabase()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));
