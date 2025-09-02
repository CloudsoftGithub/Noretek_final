// src/app/support/api/route.js
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST create a new ticket
export async function POST(req) {
  try {
    await dbConnect();
    const { title, description, category, priority, status, created_by } = await req.json();

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority: priority || "low",
      status: status || "open",
      created_by,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}