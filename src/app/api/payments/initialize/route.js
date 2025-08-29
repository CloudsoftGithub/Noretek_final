// src/app/api/payments/initialize/route.js
import { NextResponse } from 'next/server';
import { initializeTransaction } from '@/lib/paystack';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const client = await clientPromise; // ✅ Await the promise
    const db = client.db("noretek_energy_db");
    
    const { email, amount, metadata } = await request.json();

    if (!email || !amount) {
      return NextResponse.json({
        status: false,
        message: 'Email and amount are required'
      }, { status: 400 });
    }

    if (amount < 100) {
      return NextResponse.json({
        status: false,
        message: 'Minimum amount is ₦100'
      }, { status: 400 });
    }

    const payload = {
      email,
      amount: amount * 100,
      metadata: metadata || {},
      callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/customer_payment_dashboard`,
    };

    console.log('🚀 Initializing payment with callback:', payload.callback_url);

    const response = await initializeTransaction(payload);
    
    if (response.status) {
      console.log('✅ Payment initialized with reference:', response.data.reference);
      
      // ✅ Use native MongoDB insert
      try {
        await db.collection('payments').insertOne({
          reference: response.data.reference,
          user_id: metadata?.user_id || null,
          customer_email: email,
          amount: amount,
          currency: 'NGN',
          channel: 'paystack',
          metadata: {
            ...metadata,
            authorization_url: response.data.authorization_url,
            callback_url: payload.callback_url
          },
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('💾 Payment record created');
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 Payment initialization error:', error);
    return NextResponse.json({
      status: false,
      message: error.message || 'Failed to initialize transaction'
    }, { status: 500 });
  }
}