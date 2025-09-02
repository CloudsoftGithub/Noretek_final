// src/app/api/support/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const ticket = await Ticket.findById(id)
      .populate("created_by", "username email name")
      .populate("category", "name description");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("❌ Error fetching ticket:", err);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const updates = await request.json();

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("created_by", "username email name")
      .populate("category", "name description");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("❌ Error updating ticket:", err);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}