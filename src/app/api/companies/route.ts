import { NextResponse } from 'next/server';
import { getAllCompanies, getCompanyById, getCompanyInsuranceTypes, isDatabaseInitialized } from '@/lib/db';

// Get all companies with their available insurance types
export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const companyId = searchParams.get('companyId');
    const insuranceType = searchParams.get('type');
    
    // Check if database is initialized
    const initialized = await isDatabaseInitialized();
    if (!initialized) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not initialized', 
          message: 'Please initialize the database first by using the "Initialize Database" button on the home page or running "npm run init-db"'
        },
        { status: 503 }
      );
    }
    
    // If companyId is provided, get details for that specific company
    if (companyId) {
      console.log(`Fetching company details for ID: ${companyId}`);
      const company = await getCompanyById(companyId);
      
      if (!company) {
        console.error(`Company not found with ID: ${companyId}`);
        return NextResponse.json(
          { success: false, error: 'Company not found' },
          { status: 404 }
        );
      }
      
      // If insurance type is specified, filter to only that type
      if (insuranceType) {
        const types = company.insuranceTypes.filter(type => type.type === insuranceType);
        return NextResponse.json({
          success: true,
          data: {
            ...company,
            insuranceTypes: types
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: company
      });
    }
    
    // Otherwise, get all companies (simplified data)
    const companies = await getAllCompanies();
    
    // If insurance type is specified, filter companies offering that type
    if (insuranceType) {
      const filteredCompanies = companies.filter(company => 
        company.insuranceTypes.includes(insuranceType)
      );
      
      return NextResponse.json({
        success: true,
        data: filteredCompanies
      });
    }
    
    return NextResponse.json({
      success: true,
      data: companies
    });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
