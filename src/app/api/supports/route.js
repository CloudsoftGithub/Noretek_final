// src/app/api/support/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Category from "@/models/Category";

// ✅ GET all tickets
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    
    const filter = {};
    if (status && status !== 'all') filter.status = status.toLowerCase();
    if (priority && priority !== 'all') filter.priority = priority.toLowerCase();
    if (category && category !== 'all') filter.category = category;

    const tickets = await Ticket.find(filter)
      .populate("created_by", "username email name")
      .populate("category", "name description")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tickets });

  } catch (err) {
    console.error("❌ Error fetching tickets:", err);
    return NextResponse.json(
      { error: "Failed to fetch tickets. Please try again later." },
      { status: 500 }
    );
  }
}

// ✅ POST create a new ticket
export async function POST(req) {
  try {
    await dbConnect();
    
    const { title, description, category, priority, status, created_by } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Ticket title is required" },
        { status: 400 }
      );
    }

    if (!created_by) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.create({
      title: title.trim(),
      description: description?.trim() || '',
      category: category || null,
      priority: priority?.toLowerCase() || 'low',
      status: status?.toLowerCase() || 'open',
      created_by,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("created_by", "username email name")
      .populate("category", "name description");

    return NextResponse.json(
      { 
        message: "Ticket created successfully", 
        ticket: populatedTicket 
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("❌ Error creating ticket:", err);
    return NextResponse.json(
      { error: "Failed to create ticket. Please try again later." },
      { status: 500 }
    );
  }
}