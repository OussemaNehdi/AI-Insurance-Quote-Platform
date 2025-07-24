import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real application, this would calculate an actual quote based on the provided data
    // For now, we'll just return a sample value of $1000
    const quoteAmount = 1000;
    
    return NextResponse.json({ 
      success: true,
      quote: {
        amount: quoteAmount,
        currency: 'USD',
        period: 'monthly',
        details: `Quote for ${data.insuranceType} insurance`
      },
      userInfo: data
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
