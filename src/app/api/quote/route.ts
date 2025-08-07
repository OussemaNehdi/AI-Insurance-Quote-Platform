import { NextResponse } from 'next/server';
import { getCompanyById } from '@/lib/db';
import { calculateInsurancePrice } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Quote request data:", JSON.stringify(data));
    
    // Check if basic required fields are present
    const basicFields = ['companyId', 'insuranceType'];
    const missingBasicFields = basicFields.filter(field => !data[field]);
    
    if (missingBasicFields.length > 0) {
      console.error(`Missing basic fields: ${missingBasicFields.join(', ')}`);
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingBasicFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Get company details
    const company = await getCompanyById(data.companyId);
    
    if (!company) {
      console.error(`Company not found with ID: ${data.companyId}`);
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Find the insurance type configuration
    const insuranceConfig = company.insuranceTypes.find(
      type => type.type === data.insuranceType
    );
    
    if (!insuranceConfig) {
      console.error(`Insurance type not found: ${data.insuranceType} for company: ${company.companyName}`);
      return NextResponse.json(
        { success: false, error: 'Insurance type not found for this company' },
        { status: 404 }
      );
    }
    
    // Validate that all configured fields are present in the data
    const requiredFields = insuranceConfig.fields.map(field => field.name);
    const missingFields = requiredFields.filter(field => !data[field]);
    const invalidFields: string[] = [];
    
    // Validate field values
    for (const field of requiredFields) {
      if (data[field]) {
        const fieldConfig = insuranceConfig.fields.find(f => f.name === field);
        if (fieldConfig) {
          if (fieldConfig.type === 'range') {
            const value = Number(data[field]);
            if (isNaN(value)) {
              invalidFields.push(`${field} (must be a number)`);
            }
          } else if (fieldConfig.type === 'select' && fieldConfig.options) {
            const validValues = fieldConfig.options.map(opt => opt.value);
            if (!validValues.includes(data[field])) {
              invalidFields.push(`${field} (must be one of: ${validValues.join(', ')})`);
            }
          }
        }
      }
    }
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json(
        { success: false, error: `Missing required fields for ${insuranceConfig.displayName}: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    if (invalidFields.length > 0) {
      console.error(`Invalid field values: ${invalidFields.join(', ')}`);
      return NextResponse.json(
        { success: false, error: `Invalid field values: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Calculate the quote based on the company's configuration and user data
    const quoteData = calculateInsurancePrice(insuranceConfig, data);
    console.log("Quote calculation result:", JSON.stringify(quoteData));
    
    // Format the quote data for consistent currency display
    const formattedAmount = Math.round(quoteData.totalPrice * 100) / 100;
    const formattedBasePrice = Math.round(quoteData.basePrice * 100) / 100;
    
    // Format the adjustments for better display
    const formattedAdjustments = quoteData.adjustments.map(adj => {
      const factor = Math.round(adj.factor * 100) / 100;
      const percentage = Math.round((adj.factor - 1) * 100);
      const sign = percentage >= 0 ? '+' : '';
      
      return {
        ...adj,
        factor,
        percentage: `${sign}${percentage}%`
      };
    });
    
    return NextResponse.json({ 
      success: true,
      quote: {
        amount: formattedAmount,
        basePrice: formattedBasePrice,
        totalPrice: formattedAmount, // For compatibility
        currency: 'USD',
        period: 'monthly',
        details: `Quote for ${insuranceConfig.displayName} from ${company.companyName}`,
        adjustments: formattedAdjustments
      },
      userInfo: data,
      companyInfo: {
        companyId: company.companyId,
        companyName: company.companyName,
        insuranceType: data.insuranceType,
        displayName: insuranceConfig.displayName
      }
    });
  } catch (error: any) {
    console.error('Error generating quote:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
