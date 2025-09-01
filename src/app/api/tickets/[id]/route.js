// src/app/api/tickets/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

// ✅ GET a single ticket by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const ticket = await Ticket.findById(params.id)
      .populate("category", "name")
      .populate("created_by", "username email")
      .populate("assigned_to", "username email")
      .lean();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE a ticket
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    // enforce enum consistency
    if (body.priority) body.priority = body.priority.toLowerCase();
    if (body.status) body.status = body.status.toLowerCase();

    const updatedTicket = await Ticket.findByIdAndUpdate(params.id, body, {
      new: true,
    })
      .populate("category", "name")
      .populate("created_by", "username email")
      .populate("assigned_to", "username email")
      .lean();

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (err) {
    console.error("❌ Error updating ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

// ✅ DELETE a ticket
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const deleted = await Ticket.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Ticket deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error deleting ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
