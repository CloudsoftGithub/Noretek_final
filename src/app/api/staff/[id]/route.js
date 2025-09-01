// src/app/api/staff/[id]/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Staff from "@/models/Staff";
import { connectDB } from "@/lib/mongodb";

// GET Staff by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const staff = await Staff.findById(id).select("-password");
    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching staff" },
      { status: 500 }
    );
  }
}

// UPDATE Staff by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { name, email, phone, address, role } = body;

    const updated = await Staff.findByIdAndUpdate(
      id,
      { name, email, phone, address, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Staff updated successfully",
      staff: updated,
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { success: false, message: "Error updating staff" },
      { status: 500 }
    );
  }
}

// PATCH → Block/Unblock staff by ID
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { isBlocked } = body;

    const updated = await Staff.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).select("-password");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    const statusMsg = isBlocked ? "Staff blocked" : "Staff unblocked";
    return NextResponse.json({
      success: true,
      message: statusMsg,
      staff: updated,
    });
  } catch (error) {
    console.error("Error blocking/unblocking staff:", error);
    return NextResponse.json(
      { success: false, message: "Error blocking/unblocking staff" },
      { status: 500 }
    );
  }
}

// DELETE Staff by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Staff deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting staff" },
      { status: 500 }
    );
  }
}