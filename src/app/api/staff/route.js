// src/app/api/staff/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Staff from "@/models/Staff";
import { connectDB } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// GET All Staff
export async function GET() {
  try {
    await connectDB();
    const staffList = await Staff.find().select("-password"); // Exclude passwords
    return NextResponse.json({ success: true, staff: staffList });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching staff" },
      { status: 500 }
    );
  }
}

// CREATE Staff (Signup)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, address, password, confirmPassword, role } = body;

    if (!name || !email || !phone || !address || !password || !confirmPassword || !role) {
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

    // Check if email is already used
    const existingEmail = await Staff.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if role is already taken (if role should be unique)
    const existingRole = await Staff.findOne({ role });
    if (existingRole) {
      return NextResponse.json(
        { success: false, message: `${role} role already exists` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const staff = await Staff.create({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role,
      isBlocked: false,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return staff without password
    const { password: _, ...staffWithoutPassword } = staff.toObject();

    return NextResponse.json(
      { 
        success: true, 
        message: "Staff created successfully", 
        staff: staffWithoutPassword, 
        token 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Staff creation error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}