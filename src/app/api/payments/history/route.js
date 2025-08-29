// src/app/api/payments/history/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const client = await clientPromise; // ✅ Await the promise
    const db = client.db("noretek_energy_db");
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // ✅ Use native MongoDB find
    const payments = await db.collection('payments')
      .find({ customer_email: email })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      payments: payments 
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}