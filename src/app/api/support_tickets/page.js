import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

// GET all tickets
export async function GET() {
  await dbConnect();

  try {
    const tickets = await SupportTicket.find()
      .populate("created_by", "name")
      .populate("category_id", "name")
      .sort({ created_at: -1 });

    const result = tickets.map((t) => ({
      ticket_id: t._id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      created_by_name: t.created_by?.name || "Unknown",
      category_name: t.category_id?.name || "Uncategorized",
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create new ticket
export async function POST(req) {
  await dbConnect();

  try {
    const { title, description, category_id, priority, status, created_by } =
      await req.json();

    const ticket = await SupportTicket.create({
      title,
      description,
      category_id,
      priority: priority || "Low",
      status: status || "Open",
      created_by,
    });

    return NextResponse.json({ ticket_id: ticket._id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
