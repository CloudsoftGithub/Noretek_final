import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Category from "@/models/Category";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  let filter = {};
  if (status) filter.status = status;
  if (role === "customer") filter.created_by = user_id;
  if (role === "staff") filter.assigned_to = user_id;

  try {
    const tickets = await Ticket.find(filter)
      .populate("category", "name")
      .populate("created_by", "name")
      .populate("assigned_to", "name")
      .lean();

    return NextResponse.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { title, description, priority, category_id, created_by } = body;

    if (!title || !created_by) {
      return NextResponse.json({ error: "Title and created_by required" }, { status: 400 });
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      category: category_id || null,
      created_by,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    console.error("Error creating ticket:", err);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
