// src/app/support/api/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Category from "@/models/Category";

// ✅ GET all tickets with optional filtering
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter = {};
    if (status && status !== 'all') filter.status = status.toLowerCase();
    if (priority && priority !== 'all') filter.priority = priority.toLowerCase();
    if (category && category !== 'all') filter.category = category;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population, filtering, sorting, and pagination
    const tickets = await Ticket.find(filter)
      .populate("created_by", "username email name")
      .populate("category", "name description")
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Ticket.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      tickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalTickets: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    });

  } catch (err) {
    console.error("❌ Error fetching tickets:", err);
    return NextResponse.json(
      { error: "Failed to fetch tickets. Please try again later." },
      { status: 500 }
    );
  }
}

// ✅ POST create a new ticket with validation
export async function POST(req) {
  try {
    await dbConnect();
    
    const { title, description, category, priority, status, created_by } = await req.json();

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Ticket title is required" },
        { status: 400 }
      );
    }

    if (!created_by) {
      return NextResponse.json(
        { error: "User ID (created_by) is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const userExists = await User.findById(created_by);
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const finalPriority = priority?.toLowerCase() || 'low';
    if (!validPriorities.includes(finalPriority)) {
      return NextResponse.json(
        { error: "Invalid priority level" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['open', 'in progress', 'resolved', 'closed'];
    const finalStatus = status?.toLowerCase() || 'open';
    if (!validStatuses.includes(finalStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket = await Ticket.create({
      title: title.trim(),
      description: description?.trim() || '',
      category: category || null,
      priority: finalPriority,
      status: finalStatus,
      created_by,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Populate the created ticket for response
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
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "A ticket with similar details already exists" },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create ticket. Please try again later." },
      { status: 500 }
    );
  }
}

// ✅ OPTIONS handler for CORS (if needed)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}