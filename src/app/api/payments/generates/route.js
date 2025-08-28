// app/api/tokens/generate/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const { reference, amount, meterNumber } = await request.json();

    if (!reference || !amount || !meterNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Reference, amount, and meter number are required",
        },
        { status: 400 }
      );
    }

    const client = await db;
    const paymentsCollection = client.db().collection("payments");
    const meterTokensCollection = client.db().collection("meter_tokens");

    // Verify payment
    const payment = await paymentsCollection.findOne({ reference });

    if (!payment || payment.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found or not successful",
        },
        { status: 400 }
      );
    }

    // Check if token already exists
    const existingToken = await meterTokensCollection.findOne({ reference });

    if (existingToken) {
      return NextResponse.json({
        success: true,
        token: existingToken.token,
        meterNumber,
        units: (amount / 55).toFixed(2),
        amount,
        reference,
        message: "Token already generated",
      });
    }

    // Calculate units
    const ratePerKwh = 55;
    const units = (amount / ratePerKwh).toFixed(2);

    // Generate token (20 digits)
    let token;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      token = Array.from({ length: 20 }, () =>
        Math.floor(Math.random() * 10)
      ).join("");
      attempts++;

      try {
        // Expiry: 72 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 72);

        // Insert into MongoDB
        await meterTokensCollection.insertOne({
          reference,
          meterNumber,
          amount,
          units,
          token,
          customer_email: payment.customer_email,
          expiresAt,
          createdAt: new Date(),
        });

        // Update payment metadata
        const updatedMetadata = {
          ...(payment.metadata || {}),
          token_generated: true,
          meter_number: meterNumber,
          units,
          token,
        };

        await paymentsCollection.updateOne(
          { reference },
          { $set: { metadata: updatedMetadata } }
        );

        return NextResponse.json({
          success: true,
          token,
          meterNumber,
          units,
          amount,
          reference,
          expiresAt: expiresAt.toISOString(),
        });
      } catch (error) {
        if (
          error.code === 11000 && // Mongo duplicate key error
          attempts < maxAttempts
        ) {
          console.log(
            `Duplicate token detected, retrying (${attempts}/${maxAttempts})`
          );
          continue;
        }
        throw error;
      }
    } while (attempts < maxAttempts);

    throw new Error("Failed to generate unique token after multiple attempts");
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + error.message,
      },
      { status: 500 }
    );
  }
}