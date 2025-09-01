// src/app/api/support_tickets/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import { ObjectId } from "mongodb";

// GET single support ticket
export async function GET(req, { params }) {
  try {
    await connectDB();

    const ticket = await SupportTicket.findById(params.id)
      .populate("created_by", "name email")
      .populate("category_id", "name")
      .populate("assigned_to", "name email")
      .lean();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({
      ticket_id: ticket._id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      created_by: ticket.created_by ? {
        id: ticket.created_by._id,
        name: ticket.created_by.name,
        email: ticket.created_by.email
      } : null,
      category: ticket.category_id ? {
        id: ticket.category_id._id,
        name: ticket.category_id.name
      } : null,
      assigned_to: ticket.assigned_to ? {
        id: ticket.assigned_to._id,
        name: ticket.assigned_to.name,
        email: ticket.assigned_to.email
      } : null,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      due_date: ticket.due_date,
      resolution: ticket.resolution
    }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching support ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch support ticket" },
      { status: 500 }
    );
  }
}

// PUT update support ticket
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    // enforce enum consistency
    if (body.priority) body.priority = body.priority.toLowerCase();
    if (body.status) body.status = body.status.toLowerCase();

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      params.id,
      { 
        ...body,
        updated_at: new Date()
      },
      { 
        new: true,
        runValidators: true 
      }
    )
      .populate("created_by", "name email")
      .populate("category_id", "name")
      .populate("assigned_to", "name email")
      .lean();

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Support ticket updated successfully",
      ticket: updatedTicket
    }, { status: 200 });
  } catch (err) {
    console.error("❌ Error updating support ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to update support ticket" },
      { status: 500 }
    );
  }
}

// DELETE support ticket
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const deletedTicket = await SupportTicket.findByIdAndDelete(params.id);

    if (!deletedTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Support ticket deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error deleting support ticket:", err.message);
    return NextResponse.json(
      { error: "Failed to delete support ticket" },
      { status: 500 }
    );
  }
}