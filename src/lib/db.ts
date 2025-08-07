import { MongoClient, Db, ObjectId, Collection } from 'mongodb';
import { CompanySettings, InsuranceType, User } from '@/lib/types';
import { hash, compare } from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  console.warn('MongoDB connection string missing in .env, will use local fallback');
}

// Primary MongoDB connection string from env
const uri = process.env.DATABASE_URL || 'mxxxxongodb://locaxxlhost:270xx17/insuxrance-ai';

// Fallback to local MongoDB if cloud connection fails
const localUri = 'xxmongodb://locaxxlhost:2701xx7/inxsurance-ai';
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // If we have cached values, use them
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Try main connection first
  try {
    console.log('Attempting to connect to primary MongoDB instance...');
    // Connect to MongoDB with improved options
    const client = new MongoClient(uri, {
      // Add connection options to resolve SSL/TLS issues
      ssl: process.env.MONGODB_SSL !== 'false',
      tls: process.env.MONGODB_TLS !== 'false',
      tlsAllowInvalidCertificates: true, // Use only for development
      directConnection: false,
      retryWrites: true,
      connectTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
    });
    
    await client.connect();
    const db = client.db('insurance-ai');
    
    console.log('Successfully connected to primary MongoDB instance');
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (primaryError: any) {
    console.error('Primary MongoDB connection error:', primaryError);
    console.log('Attempting to connect to local fallback MongoDB...');
    
    // Try local fallback if primary connection fails
    try {
      const localClient = new MongoClient(localUri, {
        // Simpler options for local connection
        ssl: false,
        tls: false,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      });
      
      await localClient.connect();
      const localDb = localClient.db('insurance-ai');
      
      console.log('Successfully connected to local fallback MongoDB');
      
      // Cache the fallback connection
      cachedClient = localClient;
      cachedDb = localDb;
      
      return { client: localClient, db: localDb };
    } catch (fallbackError: any) {
      console.error('Local MongoDB fallback connection error:', fallbackError);
      throw new Error(`Failed to connect to MongoDB: Primary - ${primaryError.message}, Fallback - ${fallbackError.message}`);
    }
  }
}

/**
 * Helper function to get a collection
 */
export async function getCollection(name: string): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(name);
}

/**
 * Check the database connection and return status information
 * Useful for diagnostics and health checks
 */
export async function checkDatabaseConnection(): Promise<{
  status: 'connected' | 'error';
  connectionType: 'cloud' | 'local' | 'none';
  details: string;
  databaseName?: string;
  collections?: string[];
}> {
  try {
    const { client, db } = await connectToDatabase();
    
    // Check which connection we're using
    const connectionType = client.options.hosts?.some(h => 
      h.host.includes('localhost') || h.host.includes('127.0.0.1')
    ) ? 'local' : 'cloud';
    
    // Get collections
    const collections = await db.listCollections().toArray();
    
    return {
      status: 'connected',
      connectionType,
      details: `Connected to ${connectionType} database`,
      databaseName: db.databaseName,
      collections: collections.map(c => c.name)
    };
  } catch (error: any) {
    return {
      status: 'error',
      connectionType: 'none',
      details: `Connection error: ${error.message || 'Unknown error'}`
    };
  }
}

// User Authentication Functions
export async function createUser(email: string, password: string, role: 'admin' | 'company' = 'company'): Promise<User> {
  const { db } = await connectToDatabase();
  
  // Check if user exists
  const existingUser = await db.collection('users').findOne({ email });
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash the password
  const hashedPassword = await hash(password, 10);
  
  // Create a new user
  const result = await db.collection('users').insertOne({
    email,
    password: hashedPassword,
    role,
    createdAt: new Date()
  });
  
  // Create a new company profile for company users
  let companyId = null;
  if (role === 'company') {
    const companyResult = await db.collection('companies').insertOne({
      companyName: email.split('@')[0] + ' Insurance',
      email,
      createdAt: new Date(),
      insuranceTypes: []
    });
    companyId = companyResult.insertedId.toString();
    
    // Update the user with companyId
    await db.collection('users').updateOne(
      { _id: result.insertedId },
      { $set: { companyId } }
    );
  }
  
  // Return user without password
  return {
    id: result.insertedId.toString(),
    email,
    companyId,
    role
  };
}

export async function loginUser(email: string, password: string): Promise<User> {
  const { db } = await connectToDatabase();
  
  console.log(`Attempting login for: ${email}`);
  
  // Find the user
  const user = await db.collection('users').findOne({ email });
  
  if (!user) {
    console.error(`User not found: ${email}`);
    throw new Error('User not found');
  }
  
  console.log(`User found: ${user._id.toString()}, comparing passwords`);
  
  // Compare passwords
  try {
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      console.error(`Invalid password for user: ${email}`);
      throw new Error('Invalid password');
    }
    
    console.log(`Login successful for: ${email}`);
    
    // Return user without password
    return {
      id: user._id.toString(),
      email: user.email,
      companyId: user.companyId,
      role: user.role
    };
  } catch (error) {
    console.error(`Password comparison error for ${email}:`, error);
    throw new Error('Invalid password');
  }
}

// Company Functions
export async function getCompanyById(companyId: string): Promise<CompanySettings | null> {
  const { db } = await connectToDatabase();
  
  try {
    const company = await db.collection('companies').findOne({ 
      _id: new ObjectId(companyId)
    });
    
    if (!company) return null;
    
    return {
      companyId: company._id.toString(),
      companyName: company.companyName,
      email: company.email,
      website: company.website,
      phone: company.phone,
      address: company.address,
      logo: company.logo,
      insuranceTypes: company.insuranceTypes || []
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
}

export async function updateCompany(companyId: string, data: Partial<CompanySettings>): Promise<CompanySettings | null> {
  const { db } = await connectToDatabase();
  
  try {
    // Remove companyId from update data if present
    const { companyId: _, ...updateData } = data;
    
    await db.collection('companies').updateOne(
      { _id: new ObjectId(companyId) },
      { $set: updateData }
    );
    
    return await getCompanyById(companyId);
  } catch (error) {
    console.error('Error updating company:', error);
    return null;
  }
}

// Insurance Type Functions
export async function getCompanyInsuranceTypes(companyId: string): Promise<InsuranceType[]> {
  const company = await getCompanyById(companyId);
  return company?.insuranceTypes || [];
}

export async function updateInsuranceTypes(companyId: string, insuranceTypes: InsuranceType[]): Promise<boolean> {
  const { db } = await connectToDatabase();
  
  try {
    await db.collection('companies').updateOne(
      { _id: new ObjectId(companyId) },
      { $set: { insuranceTypes } }
    );
    
    return true;
  } catch (error) {
    console.error('Error updating insurance types:', error);
    return false;
  }
}

// Get all companies (simplified for listing)
export async function getAllCompanies(): Promise<{ companyId: string; companyName: string; insuranceTypes: { type: string; displayName: string }[] }[]> {
  const { db } = await connectToDatabase();
  
  try {
    const companies = await db.collection('companies')
      .find({})
      .project({ 
        companyName: 1, 
        insuranceTypes: { $map: { 
          input: "$insuranceTypes", 
          as: "typeObj", 
          in: { 
            type: "$$typeObj.type",
            displayName: "$$typeObj.displayName"
          }
        }}
      })
      .toArray();
    
    return companies.map(company => ({
      companyId: company._id.toString(),
      companyName: company.companyName,
      insuranceTypes: company.insuranceTypes || []
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

// Get all companies with their insurance types (alias for consistency)
export async function getAllCompaniesWithInsuranceTypes(insuranceType?: string | null): Promise<{ companyId: string; companyName: string; insuranceTypes: { type: string; displayName: string }[] }[]> {
  const companies = await getAllCompanies();
  
  if (insuranceType) {
    return companies.filter(company => 
      company.insuranceTypes.some(type => type.type === insuranceType)
    );
  }
  
  return companies;
}

// Check if the database has been initialized with sample data
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    
    // Check if companies collection exists and has documents
    const companiesCount = await db.collection('companies').countDocuments({});
    
    // Consider the database initialized if there's at least one company
    return companiesCount > 0;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
}
