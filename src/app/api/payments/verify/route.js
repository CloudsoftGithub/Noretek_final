// app/api/payments/verify/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    
    if (!reference) {
      return NextResponse.json({ 
        success: false,
        message: 'Reference is required' 
      }, { status: 400 });
    }

    console.log('🔍 Verifying payment with reference:', reference);

    const client = await clientPromise;
    const db = client.db("noretek_energy_db");
    
    // Check current status in database
    const currentPayment = await db.collection('payments').findOne({ reference });
    console.log('📊 Current DB status:', currentPayment?.status);

    // First verify with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const paystackData = await paystackResponse.json();
    console.log('✅ Paystack response status:', paystackData.data?.status);
    
    let dbUpdated = false;
    
    if (paystackData.status && paystackData.data.status === 'success') {
      console.log('💰 Payment successful, vending token...');
      
      // Get meter number and amount from payment metadata
      const meterNumber = currentPayment?.metadata?.meterNumber;
      const amount = paystackData.data.amount / 100;
      
      if (!meterNumber) {
        throw new Error('Meter number not found in payment metadata');
      }

      try {
        // Call vending API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const vendResponse = await fetch('http://47.107.69.132:9400/API/Token/CreditToken/Generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            meterId: meterNumber,
            amount: amount,
            authorizationPassword: 'Ntk0001@#',
            serialNumber: reference,
            company: "Noretek Energy",
            isVendByTotalPaid: true,
            isPreview: false
          })
        });
        
        clearTimeout(timeoutId);
        
        const vendData = await vendResponse.json();
        
        if (vendResponse.ok && vendData.result) {
          // Update payment status in database
          const result = await db.collection('payments').updateOne(
            { reference },
            { 
              $set: { 
                status: 'success',
                paid_at: paystackData.data.paid_at || new Date(),
                updated_at: new Date(),
                token: vendData.result.token,
                token_units: vendData.result.totalUnit
              } 
            }
          );
          
          dbUpdated = result.modifiedCount > 0;
          
          if (dbUpdated) {
            console.log('✅ Database updated successfully with token');
          }
          
          return NextResponse.json({
            status: true,
            data: {
              ...paystackData.data,
              token: vendData.result.token,
              units: vendData.result.totalUnit,
              meterNumber: meterNumber
            },
            dbUpdated: dbUpdated
          });
          
        } else {
          throw new Error(vendData.message || 'Vend API failed');
        }
        
      } catch (vendError) {
        console.error('💥 Vend API error:', vendError);
        
        // Update payment as success but mark token as pending
        const result = await db.collection('payments').updateOne(
          { reference },
          { 
            $set: { 
              status: 'success',
              paid_at: paystackData.data.paid_at || new Date(),
              updated_at: new Date(),
              token_status: 'pending'
            } 
          }
        );
        
        dbUpdated = result.modifiedCount > 0;
        
        return NextResponse.json({
          status: true,
          data: {
            ...paystackData.data,
            token_status: 'pending',
            message: 'Payment successful but token generation delayed'
          },
          dbUpdated: dbUpdated,
          vendError: vendError.message
        });
      }
      
    } else if (paystackData.data.status === 'failed') {
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
      
      return NextResponse.json({
        status: false,
        data: paystackData.data,
        dbUpdated: dbUpdated
      });
    }

  } catch (error) {
    console.error('💥 Payment verification error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Failed to verify transaction'
    }, { status: 500 });
  }
}