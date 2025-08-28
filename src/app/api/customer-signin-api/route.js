// app/api/login/route.js
import { connectDB } from "@/lib/db";
import CustomerTable from "@/models/CustomerTable";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    const customer = await CustomerTable.findOne({ email });
    if (!customer) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Login successful",
        role: customer.role,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}
