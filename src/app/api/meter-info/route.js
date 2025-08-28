import { NextResponse } from 'next/server';
import { paymentQueries } from '@/lib/paymentQueries';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const meterId = searchParams.get('meterId');
    
    if (!meterId) {
      return NextResponse.json({ error: 'Meter ID is required' }, { status: 400 });
    }

    // Fetch meter information from your database
    // This is a placeholder - implement based on your database structure
    const meterInfo = {
      meterId: meterId,
      customerName: "Customer Name", // Fetch from your database
      propertyName: "Property Name", // Fetch from your database
      unitDescription: "Unit Description", // Fetch from your database
      balance: 0, // Fetch from your database
      status: "active", // Fetch from your database
      lastTokenDate: new Date().toISOString() // Fetch from your database
    };

    return NextResponse.json(meterInfo);
  } catch (error) {
    console.error('Error fetching meter info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}