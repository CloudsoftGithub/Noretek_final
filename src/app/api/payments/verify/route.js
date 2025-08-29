// src/app/api/payments/verify/route.js
import { NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/paystack';
import clientPromise from '@/lib/mongodb'; // Import the promise

export async function GET(request) {
  try {
    // ✅ Correct usage: await the promise
    const client = await clientPromise;
    const db = client.db("noretek_energy_db");
    
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    
    if (!reference) {
      return NextResponse.json({ 
        success: false,
        message: 'Reference is required' 
      }, { status: 400 });
    }

    console.log('🔍 Verifying payment with reference:', reference);

    // ✅ Use native MongoDB driver syntax
    const currentPayment = await db.collection('payments').findOne({ reference });
    console.log('📊 Current DB status:', currentPayment?.status);

    const response = await verifyTransaction(reference);
    console.log('✅ Paystack response status:', response.data?.status);
    
    let dbUpdated = false;
    
    if (response.status && response.data.status === 'success') {
      console.log('💰 Payment successful, updating database...');
      
      // ✅ Use native MongoDB update
      const result = await db.collection('payments').updateOne(
        { reference },
        { 
          $set: { 
            status: 'success',
            paid_at: response.data.paid_at || new Date(),
            updated_at: new Date()
          } 
        }
      );
      
      dbUpdated = result.modifiedCount > 0;

      if (dbUpdated) {
        console.log('✅ Database updated successfully');
      } else {
        console.log('❌ Database update failed');
      }
      
    } else if (response.data.status === 'failed') {
      console.log('❌ Payment failed, updating database...');
      const result = await db.collection('payments').updateOne(
        { reference },
        { 
          $set: { 
            status: 'failed',
            updated_at: new Date()
          } 
        }
      );
      dbUpdated = result.modifiedCount > 0;
    }

    return NextResponse.json({
      ...response,
      dbUpdated: dbUpdated,
      previousStatus: currentPayment?.status
    });

  } catch (error) {
    console.error('💥 Payment verification error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Failed to verify transaction'
    }, { status: 500 });
  }
}