import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const ticket = await Ticket.findById(params.id)
      .populate("category", "name")
      .populate("created_by", "name")
      .populate("assigned_to", "name")
      .lean();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const body = await req.json();
    const updatedTicket = await Ticket.findByIdAndUpdate(params.id, body, {
      new: true,
    })
      .populate("category", "name")
      .populate("created_by", "name")
      .populate("assigned_to", "name")
      .lean();

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTicket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const deleted = await Ticket.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({}, { status: 204 });
  } catch (err) {
    console.error("Error deleting ticket:", err);
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
