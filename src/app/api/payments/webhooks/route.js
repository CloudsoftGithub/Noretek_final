// src/app/api/payments/webhooks/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function POST(request) {
  try {
    await connectDB();
    
    const payload = await request.json();
    console.log("📩 Paystack webhook received:", payload);

    if (payload.event === "charge.success") {
      const { reference, paid_at } = payload.data;

      await Payment.findOneAndUpdate(
        { reference },
        {
          status: "success",
          paid_at: paid_at || new Date()
        }
      );

      console.log("✅ Payment status updated via webhook");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("💥 Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}