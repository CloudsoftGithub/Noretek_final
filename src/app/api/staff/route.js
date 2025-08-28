import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Staff from "@/models/Staff";
import { connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // keep in .env file

// CREATE Staff (Signup)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, address, password, confirmPassword, role } =
      body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if role is already taken
    const roleTaken = await Staff.findOne({ role });
    if (roleTaken) {
      return NextResponse.json(
        { success: false, message: `${role} already exists` },
        { status: 400 }
      );
    }

    // Check if email is already used
    const existing = await Staff.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

  
    const staff = await Staff.create({
      name,
      email,
      phone,
      address,
      password,
      role,
      isBlocked: false, // default value
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      { success: true, message: "Staff created successfully", staff, token },
      { status: 201 }
    );
  } catch (error) {
    console.error("Staff error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// GET All Staff
export async function GET() {
  try {
    await connectDB();
    const staffList = await Staff.find();
    return NextResponse.json({ success: true, staff: staffList });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching staff" },
      { status: 500 }
    );
  }
}

// UPDATE Staff (PUT) → update details by ID
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, email, phone, address, role } = body;

    const updated = await Staff.findByIdAndUpdate(
      id,
      { name, email, phone, address, role },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Staff updated",
      staff: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating staff" },
      { status: 500 }
    );
  }
}

// PATCH → Block/Unblock staff
export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, block } = body; // block = true (block), false (unblock)

    const updated = await Staff.findByIdAndUpdate(
      id,
      { isBlocked: block },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    const statusMsg = block ? "Staff blocked" : "Staff unblocked";
    return NextResponse.json({
      success: true,
      message: statusMsg,
      staff: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error blocking/unblocking staff" },
      { status: 500 }
    );
  }
}

// DELETE → Remove staff by ID
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Staff deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting staff" },
      { status: 500 }
    );
  }
}
