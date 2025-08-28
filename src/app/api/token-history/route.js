import { NextResponse } from "next/server";
import { paymentQueries } from "@/lib/paymentQueries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const meterId = searchParams.get("meterId");

    if (!meterId) {
      return NextResponse.json(
        { error: "Meter ID is required" },
        { status: 400 }
      );
    }

    // Fetch token history from DB using your paymentQueries helper
    const tokenHistory = await paymentQueries.getTokenHistoryByMeterId(meterId);

    if (!tokenHistory || tokenHistory.length === 0) {
      return NextResponse.json(
        { message: "No token history found for this meter" },
        { status: 404 }
      );
    }

    return NextResponse.json({ history: tokenHistory });
  } catch (error) {
    console.error("Error fetching token history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
