// src/app/api/payments/history/route.js
import { NextResponse } from "next/server";
import { paymentQueries } from "@/lib/paymentQueries";
import { getConnectionStatus } from '@/lib/mongodb';

// ✅ Add these lines to mark the route as dynamic and specify runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const meterId = searchParams.get("meterId");
    
    console.log('DB Connection status:', getConnectionStatus());

    if (!email && !meterId) {
      return NextResponse.json(
        { error: "Either email or meterId is required" },
        { status: 400 }
      );
    }

    // ✅ Fetch by Email → Payment history
    if (email) {
      const payments = await paymentQueries.getPaymentsByEmail(email);

      if (!payments || payments.length === 0) {
        return NextResponse.json(
          { message: "No payments found for this email" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        type: "payments",
        email,
        history: payments,
      });
    }

    // ✅ Fetch by Meter ID → Token history
    if (meterId) {
      const tokenHistory = await paymentQueries.getTokenHistoryByMeterId(meterId);

      if (!tokenHistory || tokenHistory.length === 0) {
        return NextResponse.json(
          { message: "No token history found for this meter" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        type: "tokens",
        meterId,
        history: tokenHistory,
      });
    }
  } catch (error) {
    console.error("💥 Error fetching history:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}