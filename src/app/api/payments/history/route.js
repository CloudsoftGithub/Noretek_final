// api/payments/history/route.js
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await db;
    const paymentsCollection = client.db().collection("payments");

    // Find payments by customer_email
    const payments = await paymentsCollection
      .find({ customer_email: email })
      .sort({ created_at: -1 })
      .toArray();

    // Parse metadata if stored as string
    const paymentsWithParsedMetadata = payments.map((payment) => {
      if (payment.metadata && typeof payment.metadata === "string") {
        try {
          payment.metadata = JSON.parse(payment.metadata);
        } catch (e) {
          console.error("Error parsing metadata:", e);
          payment.metadata = {};
        }
      }
      return payment;
    });

    return NextResponse.json({
      success: true,
      payments: paymentsWithParsedMetadata,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}