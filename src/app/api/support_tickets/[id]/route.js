import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupportTicket from "@/models/SupportTicket";

// GET single ticket
export async function GET(req, { params }) {
  await dbConnect();

  try {
    const ticket = await SupportTicket.findById(params.id)
      .populate("created_by", "name")
      .populate("category_id", "name");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({
      ticket_id: ticket._id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      created_by: ticket.created_by?.name || "Unknown",
      category: ticket.category_id?.name || "Uncategorized",
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT update ticket
export async function PUT(req, { params }) {
  await dbConnect();

  try {
    const body = await req.json();

    await SupportTicket.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true }
    );

    return NextResponse.json({ message: "Ticket updated" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE ticket
export async function DELETE(req, { params }) {
  await dbConnect();

  try {
    await SupportTicket.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Ticket deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
