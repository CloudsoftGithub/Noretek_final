// src/app/api/support_tickets/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

// GET all support tickets
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let filter = {};
    if (status) filter.status = status.toLowerCase();
    if (priority) filter.priority = priority.toLowerCase();

    const tickets = await SupportTicket.find(filter)
      .populate("created_by", "name email")
      .populate("category_id", "name")
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json(tickets, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching support tickets:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

// POST create new support ticket
export async function POST(req) {
  try {
    await connectDB();

    const { title, description, priority, category_id, created_by } =
      await req.json();

    if (!title || !created_by) {
      return NextResponse.json(
        { error: "Title and created_by are required" },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.create({
      title,
      description: description || "",
      priority: priority?.toLowerCase() || "low",
      category_id: category_id || null,
      created_by,
      status: "open",
      created_at: new Date(),
      updated_at: new Date()
    });

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate("created_by", "name email")
      .populate("category_id", "name");

    return NextResponse.json(populatedTicket, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating support ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}