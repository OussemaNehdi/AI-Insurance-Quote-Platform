import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { hash } from 'bcryptjs';

// Initialize the database with sample data
export async function GET(request: Request) {
  try {
    // Check for API key to secure the endpoint
    const searchParams = new URL(request.url).searchParams;
    const apiKey = searchParams.get('key');
    
    if (apiKey !== 'init-insurance-platform') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Sample companies with their insurance types configurations
    const companies = [
      {
        companyName: "Secure Insurance Co.",
        email: "contact@secureinsurance.example",
        website: "https://secureinsurance.example",
        phone: "+1-555-123-4567",
        address: "123 Secure St, Insuranceville, IN 12345",
        createdAt: new Date(),
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
        createdAt: new Date(),
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
        createdAt: new Date(),
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
            type: "Travel",
            displayName: "Travel Insurance",
            basePrice: 150,
            fields: [
              {
                name: "destination",
                label: "Destination Region",
                type: "select",
                fallbackMultiplier: 1.0,
                options: [
                  { value: "North America", multiplier: 1.0 },
                  { value: "Europe", multiplier: 1.1 },
                  { value: "Asia", multiplier: 1.2 },
                  { value: "Africa", multiplier: 1.4 },
                  { value: "Australia/Oceania", multiplier: 1.2 },
                  { value: "South America", multiplier: 1.25 }
                ]
              },
              {
                name: "tripDuration",
                label: "Trip Duration",
                type: "range",
                fallbackMultiplier: 1.1,
                brackets: [
                  { min: 1, max: 7, multiplier: 0.8 },
                  { min: 8, max: 14, multiplier: 1.0 },
                  { min: 15, max: 30, multiplier: 1.3 },
                  { min: 31, max: 90, multiplier: 1.6 },
                  { min: 91, max: 365, multiplier: 2.0 }
                ]
              }
            ]
          }
        ]
      }
    ];
    
    // Clear existing collections
    console.log('Clearing existing data...');
    await db.collection('companies').deleteMany({});
    await db.collection('users').deleteMany({});
    
    // Insert companies
    console.log('Inserting companies...');
    const companyResults = await db.collection('companies').insertMany(companies);
    
    // Create admin and company users
    const users = [
      {
        email: "admin@insurance-ai.example",
        password: await hash("admin123", 10),
        role: "admin",
        createdAt: new Date()
      }
    ];
    
    // Create a user for each company
    let companyIndex = 0;
    for (const companyId of Object.values(companyResults.insertedIds)) {
      const company = companies[companyIndex];
      
      users.push({
        email: company.email,
        password: await hash("company123", 10),
        role: "company",
        companyId: companyId.toString(),
        createdAt: new Date()
      });
      
      companyIndex++;
    }
    
    console.log('Inserting users...');
    await db.collection('users').insertMany(users);
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized with sample data',
      details: {
        companies: companyResults.insertedCount,
        users: users.length
      }
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
