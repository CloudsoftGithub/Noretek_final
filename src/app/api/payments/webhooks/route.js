// api/payments/webhooks/route.js
import db from "@/lib/db"; // MongoDB connection

export async function POST(request) {
  try {
    const payload = await request.json();
    console.log("📩 Paystack webhook received:", payload);

    if (payload.event === "charge.success") {
      const { reference, paid_at } = payload.data;

      const client = await db;
      const paymentsCollection = client.db().collection("payments");

      const updateResult = await paymentsCollection.updateOne(
        { reference },
        {
          $set: {
            status: "success",
            paid_at: paid_at ? new Date(paid_at) : new Date(),
            updated_at: new Date(),
          },
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log("✅ Payment status updated via webhook");
      } else {
        console.log("⚠️ No matching payment found for reference:", reference);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("💥 Webhook error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
