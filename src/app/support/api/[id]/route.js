// src/app/support/api/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

// ✅ GET single ticket
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const ticket = await Ticket.findById(id)
      .populate("created_by", "username email")
      .populate("category", "name");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
// ymaaaaaaaaaaaaa
// ✅ PUT update a ticket
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const updates = await request.json();

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate("created_by", "username email")
     .populate("category", "name");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE a ticket
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const deleted = await Ticket.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}