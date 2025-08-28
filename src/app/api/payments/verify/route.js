// app/api/payments/verify/route.js
import { verifyTransaction } from "@/lib/paystack";
import db from "@/lib/db"; // MongoDB connection

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      return Response.json(
        {
          success: false,
          message: "Reference is required",
        },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying payment with reference:", reference);

    const client = await db;
    const paymentsCollection = client.db().collection("payments");

    // Check current payment in DB
    const currentPayment = await paymentsCollection.findOne({ reference });
    console.log("📊 Current DB status:", currentPayment?.status);

    // Verify transaction with Paystack
    const response = await verifyTransaction(reference);
    console.log("✅ Paystack response status:", response.data?.status);

    let dbUpdated = false;

    if (response.status && response.data.status === "success") {
      console.log("💰 Payment successful, updating database...");

      const updateResult = await paymentsCollection.updateOne(
        { reference },
        {
          $set: {
            status: "success",
            paid_at: response.data.paid_at
              ? new Date(response.data.paid_at)
              : new Date(),
            updated_at: new Date(),
          },
        }
      );

      dbUpdated = updateResult.modifiedCount > 0;

      if (dbUpdated) {
        console.log("✅ Database updated successfully");
      } else {
        console.log("❌ Database update failed");
      }
    } else if (response.data?.status === "failed") {
      console.log("❌ Payment failed, updating database...");

      const updateResult = await paymentsCollection.updateOne(
        { reference },
        {
          $set: {
            status: "failed",
            updated_at: new Date(),
          },
        }
      );

      dbUpdated = updateResult.modifiedCount > 0;
    }

    return Response.json({
      ...response,
      dbUpdated,
      previousStatus: currentPayment?.status,
    });
  } catch (error) {
    console.error("💥 Payment verification error:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "Failed to verify transaction",
      },
      { status: 500 }
    );
  }
}
