// src/app/api/support/route.js
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
      .populate("created_by", "username email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// ✅ POST create a new ticket
export async function POST(req) {
  try {
    await dbConnect();
    const { title, description, category, priority, status, created_by } = await req.json();

    // Validate required fields
    if (!title || !created_by) {
      return NextResponse.json(
        { error: "Title and created_by are required" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.create({
      title,
      description: description || "",
      category: category || null,
      priority: priority?.toLowerCase() || "low",
      status: status?.toLowerCase() || "open",
      created_by,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Populate the created ticket
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("created_by", "username email")
      .populate("category", "name");

    return NextResponse.json(populatedTicket, { status: 201 });
  } catch (err) {
    console.error("Error creating ticket:", err);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

// ✅ PUT update a ticket
export async function PUT(req) {
  try {
    await dbConnect();
    const { ticket_id, title, description, category, priority, status, assigned_to } = await req.json();

    if (!ticket_id) {
      return NextResponse.json(
        { error: "ticket_id is required" },
        { status: 400 }
      );
    }

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(priority && { priority: priority.toLowerCase() }),
      ...(status && { status: status.toLowerCase() }),
      ...(assigned_to && { assigned_to }),
      updatedAt: new Date()
    };

    const ticket = await Ticket.findByIdAndUpdate(
      ticket_id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("created_by", "username email")
      .populate("category", "name");

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

// ✅ DELETE a ticket
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const ticket_id = searchParams.get("ticket_id");

    if (!ticket_id) {
      return NextResponse.json(
        { error: "ticket_id parameter is required" },
        { status: 400 }
      );
    }

    const deleted = await Ticket.findByIdAndDelete(ticket_id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("Error deleting ticket:", err);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}