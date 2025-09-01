import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Category from "@/models/Category";

// ✅ GET all tickets
export async function GET() {
  try {
    await dbConnect();

    const tickets = await Ticket.find()
      .populate("created_by", "username email")   // fetch user info
      .populate("category", "name")              // fetch category name
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST create a new ticket
export async function POST(req) {
  try {
    await dbConnect();
    const { title, description, category, priority, status, created_by } = await req.json();

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority: priority || "low",
      status: status || "open",
      created_by,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ PUT update a ticket
export async function PUT(req) {
  try {
    await dbConnect();
    const { ticket_id, title, description, category, priority, status, assigned_to } = await req.json();

    const ticket = await Ticket.findByIdAndUpdate(
      ticket_id,
      {
        title,
        description,
        category,
        priority,
        status,
        assigned_to,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE a ticket
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const ticket_id = searchParams.get("ticket_id");

    if (!ticket_id) {
      return NextResponse.json({ error: "ticket_id required" }, { status: 400 });
    }

    const deleted = await Ticket.findByIdAndDelete(ticket_id);
    if (!deleted) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
