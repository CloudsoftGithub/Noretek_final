// src/app/api/tickets/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

// ✅ GET all tickets (with filters)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    let filter = {};
    if (status) filter.status = status.toLowerCase();
    if (priority) filter.priority = priority.toLowerCase();
    if (category) filter.category = category;
    if (role === "customer" && user_id) filter.created_by = user_id;
    if (role === "staff" && user_id) filter.assigned_to = user_id;

    const tickets = await Ticket.find(filter)
      .populate("category", "name")
      .populate("created_by", "username email")
      .populate("assigned_to", "username email")
      .sort({ createdAt: -1 }) // newest first
      .lean();

    return NextResponse.json(tickets, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching tickets:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// ✅ POST create a new ticket
export async function POST(req) {
  try {
    await connectDB();

    const { title, description, priority, category, created_by } =
      await req.json();

    if (!title || !created_by) {
      return NextResponse.json(
        { error: "Title and created_by are required" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.create({
      title,
      description: description || "",
      priority: priority?.toLowerCase() || "low",
      category: category || null,
      created_by,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Populate the created ticket before returning
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("category", "name")
      .populate("created_by", "username email");

    return NextResponse.json(populatedTicket, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}