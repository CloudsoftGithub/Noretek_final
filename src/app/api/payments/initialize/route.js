// src/app/api/payments/initialize/route.js
import { NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";
import dbConnect from "@/lib/mongodb"; // ✅ ensure mongoose connection
import Payment from "@/models/Payment";

export async function POST(request) {
  try {
    await dbConnect(); // ✅ connect mongoose

    const { email, amount, metadata } = await request.json();

    // ✅ Input validation
    if (!email || !amount) {
      return NextResponse.json(
        { status: false, message: "Email and amount are required" },
        { status: 400 }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        { status: false, message: "Minimum amount is ₦100" },
        { status: 400 }
      );
    }

    // ✅ Prepare Paystack payload
    const payload = {
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      metadata: metadata || {},
      callback_url: `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/customer_payment_dashboard`,
    };

    console.log("🚀 Initializing payment with callback:", payload.callback_url);

    // ✅ Call Paystack
    const response = await initializeTransaction(payload);

    if (response?.status) {
      const reference = response.data.reference;
      console.log("✅ Payment initialized with reference:", reference);

      try {
        // ✅ Check if already exists (avoid duplicates if Paystack retries)
        const existing = await Payment.findOne({ reference });

        if (!existing) {
          await Payment.create({
            reference,
            user_id: metadata?.user_id || null,
            customer_email: email.toLowerCase(),
            amount,
            currency: "NGN",
            channel: "paystack",
            metadata: {
              ...metadata,
              authorization_url: response.data.authorization_url,
              callback_url: payload.callback_url,
            },
            status: "pending",
          });

          console.log("💾 Payment record created in MongoDB:", reference);
        } else {
          console.log("♻️ Payment already exists in DB:", reference);
        }
      } catch (dbError) {
        console.error("❌ Database error while saving payment:", dbError);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Payment initialization error:", error);
    return NextResponse.json(
      {
        status: false,
        message: error.message || "Failed to initialize transaction",
      },
      { status: 500 }
    );
  }
}
