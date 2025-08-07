import { NextResponse } from 'next/server';
import { getCompanyInsuranceTypes, updateInsuranceTypes } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Get insurance types for the company
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const insuranceTypes = await getCompanyInsuranceTypes(user.companyId);
    
    return NextResponse.json({
      success: true,
      data: insuranceTypes
    });
  } catch (error: any) {
    console.error('Error fetching insurance types:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch insurance types' },
      { status: 500 }
    );
  }
}

// Update insurance types for the company
export async function PUT(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { insuranceTypes } = await request.json();
    
    if (!Array.isArray(insuranceTypes)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    const success = await updateInsuranceTypes(user.companyId, insuranceTypes);
    
    if (!success) {
      throw new Error('Failed to update insurance types');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Insurance types updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating insurance types:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update insurance types' },
      { status: 500 }
    );
  }
}
