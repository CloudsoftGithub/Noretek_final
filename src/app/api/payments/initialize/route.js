// app/api/payments/initialize/route.js
import { NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";
import db from "@/lib/db"; // MongoDB client

export async function POST(request) {
  try {
    const { email, amount, meterNumber, metadata } = await request.json();

    if (!email || !amount || !meterNumber) {
      return NextResponse.json(
        {
          status: false,
          message: "Email, amount, and meter number are required",
        },
        { status: 400 }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        {
          status: false,
          message: "Minimum amount is ₦100",
        },
        { status: 400 }
      );
    }

    const payload = {
      email,
      amount: amount * 100, // Paystack expects kobo
      metadata: {
        ...metadata,
        meter_number: meterNumber
      },
      callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment-verification`,
    };

    console.log("🚀 Initializing payment with callback:", payload.callback_url);

    const response = await initializeTransaction(payload);

    if (response.status) {
      console.log(
        "✅ Payment initialized with reference:",
        response.data.reference
      );

      try {
        const client = await db;
        const paymentsCollection = client.db().collection("payments");

        await paymentsCollection.insertOne({
          reference: response.data.reference,
          customer_email: email,
          amount: amount,
          meter_number: meterNumber,
          currency: "NGN",
          channel: "paystack",
          status: "initialized",
          metadata: {
            ...metadata,
            authorization_url: response.data.authorization_url,
            callback_url: payload.callback_url,
          },
          created_at: new Date(),
        });

        console.log("💾 Payment record created in MongoDB");
      } catch (dbError) {
        console.error("MongoDB insert error:", dbError);
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