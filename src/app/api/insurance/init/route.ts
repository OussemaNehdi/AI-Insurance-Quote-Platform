import { NextResponse } from 'next/server';
import { connectToDatabase, updateInsuranceTypes } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Sample data for initializing the database with insurance companies and their configurations
const sampleCompanies = [
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
            type: "select" as const,
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
            type: "select" as const,
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
            type: "select" as const,
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
            type: "select" as const,
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
  }
];

// Sample users for testing
const sampleUsers = [
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
    companyId: "",  // Will be set after company creation
    createdAt: new Date()
  }
];

// Initialize default insurance types for a new company
export async function POST(request: Request) {
  try {
    // Check if request is for sample data initialization
    const searchParams = new URL(request.url).searchParams;
    const apiKey = searchParams.get('key');
    
    if (apiKey === 'init-sample-data') {
      return await initializeSampleData();
    }
    
    // Normal initialization for a company
    const user = getUserFromRequest(request);
    
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create default insurance types
    const defaultInsuranceTypes = [
      {
        type: 'auto',
        displayName: 'Auto Insurance',
        basePrice: 500,
        fields: [
          {
            name: 'age',
            label: 'What is your age?',
            type: 'range' as const,
            fallbackMultiplier: 1.07,
            brackets: [
              { min: 18, max: 25, multiplier: 1.3 }, // 30% increase for young drivers
              { min: 26, max: 40, multiplier: 1.0 }, // Standard rate
              { min: 41, max: 65, multiplier: 1.05 }, // 5% increase
              { min: 66, max: 99, multiplier: 1.2 } // 20% increase for seniors
            ]
          },
          {
            name: 'gender',
            label: 'What is your gender?',
            type: 'select' as const,
            fallbackMultiplier: 1.0,
            options: [
              { value: 'Male', multiplier: 1.05 },
              { value: 'Female', multiplier: 1.0 },
              { value: 'Other', multiplier: 1.0 }
            ]
          },
          {
            name: 'country',
            label: 'In which country do you live?',
            type: 'select' as const,
            fallbackMultiplier: 1.0,
            options: [
              { value: 'USA', multiplier: 1.0 },
              { value: 'Canada', multiplier: 0.9 },
              { value: 'UK', multiplier: 1.1 },
              { value: 'Australia', multiplier: 1.05 },
              { value: 'Other', multiplier: 1.15 }
            ]
          }
        ]
      },
      {
        type: 'home',
        displayName: 'Home Insurance',
        basePrice: 800,
        fields: [
          {
            name: 'propertyValue',
            label: 'What is the approximate value of your property?',
            type: 'range' as const,
            fallbackMultiplier: 1.1,
            brackets: [
              { min: 0, max: 100000, multiplier: 0.8 },
              { min: 100001, max: 250000, multiplier: 0.9 },
              { min: 250001, max: 500000, multiplier: 1.0 },
              { min: 500001, max: 1000000, multiplier: 1.2 },
              { min: 1000001, max: 10000000, multiplier: 1.5 }
            ]
          },
          {
            name: 'propertyAge',
            label: 'How old is your property (in years)?',
            type: 'range' as const,
            fallbackMultiplier: 1.05,
            brackets: [
              { min: 0, max: 5, multiplier: 0.9 },
              { min: 6, max: 15, multiplier: 1.0 },
              { min: 16, max: 30, multiplier: 1.1 },
              { min: 31, max: 50, multiplier: 1.25 },
              { min: 51, max: 100, multiplier: 1.4 }
            ]
          },
          {
            name: 'country',
            label: 'In which country is your property located?',
            type: 'select' as const,
            fallbackMultiplier: 1.0,
            options: [
              { value: 'USA', multiplier: 1.0 },
              { value: 'Canada', multiplier: 0.9 },
              { value: 'UK', multiplier: 1.1 },
              { value: 'Australia', multiplier: 1.05 },
              { value: 'Other', multiplier: 1.15 }
            ]
          }
        ]
      },
      {
        type: 'life',
        displayName: 'Life Insurance',
        basePrice: 300,
        fields: [
          {
            name: 'age',
            label: 'What is your age?',
            type: 'range' as const,
            fallbackMultiplier: 1.1,
            brackets: [
              { min: 18, max: 30, multiplier: 0.7 },
              { min: 31, max: 40, multiplier: 0.8 },
              { min: 41, max: 50, multiplier: 1.0 },
              { min: 51, max: 60, multiplier: 1.3 },
              { min: 61, max: 70, multiplier: 1.8 },
              { min: 71, max: 99, multiplier: 2.5 }
            ]
          },
          {
            name: 'smoker',
            label: 'Are you a smoker?',
            type: 'select' as const,
            fallbackMultiplier: 1.0,
            options: [
              { value: 'Yes', multiplier: 1.5 },
              { value: 'No', multiplier: 1.0 }
            ]
          },
          {
            name: 'gender',
            label: 'What is your gender?',
            type: 'select' as const,
            fallbackMultiplier: 1.0,
            options: [
              { value: 'Male', multiplier: 1.1 },
              { value: 'Female', multiplier: 1.0 },
              { value: 'Other', multiplier: 1.05 }
            ]
          }
        ]
      },
      {
        type: 'health',
        displayName: 'Health Insurance',
        basePrice: 400,
        fields: [
          {
            name: 'age',
            label: 'What is your age?',
            type: 'range' as const,
            fallbackMultiplier: 1.05,
            brackets: [
              { min: 0, max: 18, multiplier: 0.7 },
              { min: 19, max: 35, multiplier: 0.9 },
              { min: 36, max: 50, multiplier: 1.0 },
              { min: 51, max: 65, multiplier: 1.3 },
              { min: 66, max: 99, multiplier: 1.6 }
            ]
          },
          {
            name: 'preexistingConditions',
            label: 'Do you have any pre-existing medical conditions?',
            type: 'select' as const,
            fallbackMultiplier: 1.0,
            options: [
              { value: 'Yes', multiplier: 1.3 },
              { value: 'No', multiplier: 1.0 }
            ]
          },
          {
            name: 'coverageLevel',
            label: 'What level of coverage do you need?',
            type: 'select' as const,
            fallbackMultiplier: 1.0,
            options: [
              { value: 'Basic', multiplier: 0.8 },
              { value: 'Standard', multiplier: 1.0 },
              { value: 'Premium', multiplier: 1.4 }
            ]
          }
        ]
      }
    ];
    
    // Save default types to the database
    const success = await updateInsuranceTypes(user.companyId, defaultInsuranceTypes);
    
    if (!success) {
      throw new Error('Failed to initialize insurance types');
    }
    
    return NextResponse.json({
      success: true,
      data: defaultInsuranceTypes,
      message: 'Default insurance types initialized successfully'
    });
  } catch (error: any) {
    console.error('Error initializing insurance types:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize insurance types' },
      { status: 500 }
    );
  }
}

// Helper function to initialize the database with sample data
async function initializeSampleData() {
  try {
    const { client, db } = await connectToDatabase();
    
    // Drop existing collections if they exist
    try {
      await db.collection('users').drop();
      await db.collection('companies').drop();
      console.log('Dropped existing collections');
    } catch (error) {
      console.log('No collections to drop or error dropping:', error);
    }
    
    // Insert sample companies
    const companyResults = await db.collection('companies').insertMany(sampleCompanies);
    const companyIds = Object.values(companyResults.insertedIds);
    
    // Assign company IDs to users
    sampleUsers[1].companyId = companyIds[0].toString();
    
    // Insert sample users
    await db.collection('users').insertMany(sampleUsers);
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized with sample data',
      companiesInserted: companyIds.length,
      usersInserted: sampleUsers.length
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

// GET route to check if the initialization route is available
export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    message: 'Database initialization API is available',
    instructions: 'Send a POST request to this endpoint with ?key=init-sample-data to initialize the database with sample data'
  });
}
