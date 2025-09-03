// src/app/api/payments/verify/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getConnectionStatus } from '@/lib/mongodb';
export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    console.log('DB Connection status:', getConnectionStatus());
    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying payment with reference:", reference);

    // Find payment in DB
    const currentPayment = await Payment.findOne({ reference });
    console.log("📊 Current DB status:", currentPayment?.status);

    if (!currentPayment) {
      return NextResponse.json(
        { success: false, message: "Payment not found in database" },
        { status: 404 }
      );
    }

    // Verify with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackResponse.json();
    console.log("✅ Paystack response status:", paystackData.data?.status);

    if (paystackData.status && paystackData.data.status === "success") {
      console.log("💰 Payment successful, vending token...");

      // Get meter number from metadata
      const meterNumber = currentPayment?.metadata?.meterNumber;
      const amount = paystackData.data.amount / 100;

      if (!meterNumber) {
        throw new Error("Meter number not found in payment metadata");
      }

      try {
        // Vend API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const vendResponse = await fetch(
          "http://47.107.69.132:9400/API/Token/CreditToken/Generate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              meterId: meterNumber,
              amount: amount,
              authorizationPassword: "Ntk0001@#",
              serialNumber: reference,
              company: "Noretek Energy",
              isVendByTotalPaid: true,
              isPreview: false,
            }),
          }
        );

        clearTimeout(timeoutId);

        const vendData = await vendResponse.json();

        if (vendResponse.ok && vendData.result) {
          // ✅ Update payment with token details
          currentPayment.status = "success";
          currentPayment.paid_at = paystackData.data.paid_at || new Date();
          currentPayment.token = vendData.result.token;
          currentPayment.token_units = vendData.result.totalUnit;
          await currentPayment.save();

          console.log("✅ Database updated successfully with token");

          return NextResponse.json({
            status: true,
            data: {
              ...paystackData.data,
              token: vendData.result.token,
              units: vendData.result.totalUnit,
              meterNumber: meterNumber,
            },
          });
        } else {
          throw new Error(vendData.message || "Vend API failed");
        }
      } catch (vendError) {
        console.error("💥 Vend API error:", vendError);

        // Mark payment as success but token pending
        currentPayment.status = "success";
        currentPayment.paid_at = paystackData.data.paid_at || new Date();
        currentPayment.metadata.token_status = "pending";
        await currentPayment.save();

        return NextResponse.json({
          status: true,
          data: {
            ...paystackData.data,
            token_status: "pending",
            message: "Payment successful but token generation delayed",
          },
          vendError: vendError.message,
        });
      }
    } else if (paystackData.data?.status === "failed") {
      console.log("❌ Payment failed, updating database...");
      currentPayment.status = "failed";
      await currentPayment.save();

      return NextResponse.json({
        status: false,
        data: paystackData.data,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Unhandled Paystack response",
      data: paystackData,
    });
  } catch (error) {
    console.error("💥 Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
