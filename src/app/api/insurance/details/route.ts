import { NextResponse } from 'next/server';
import { getCompanyById } from '@/lib/db';

// Get detailed insurance type information for a specific company and insurance type
export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const companyId = searchParams.get('companyId');
    const insuranceType = searchParams.get('type');
    
    if (!companyId || !insuranceType) {
      return NextResponse.json(
        { success: false, error: 'Missing companyId or insuranceType parameter' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching insurance details for company: ${companyId}, type: ${insuranceType}`);
    
    const company = await getCompanyById(companyId);
    
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Find the specific insurance type
    const insuranceTypeDetails = company.insuranceTypes.find(type => type.type === insuranceType);
    
    if (!insuranceTypeDetails) {
      return NextResponse.json(
        { success: false, error: 'Insurance type not found for this company' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        companyId: company.companyId,
        companyName: company.companyName,
        insuranceType: insuranceTypeDetails
      }
    });
    
  } catch (error) {
    console.error('Error in insurance details API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
