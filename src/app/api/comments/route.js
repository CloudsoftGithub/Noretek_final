import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

// GET comments for a ticket
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const ticket_id = searchParams.get("ticket_id");

    if (!ticket_id) {
      return NextResponse.json({ error: "ticket_id required" }, { status: 400 });
    }

    const comments = await Comment.find({ ticket: ticket_id })
      .populate("created_by", "username email")
      .sort({ created_at: 1 }); // oldest → newest

    return NextResponse.json(comments);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST add a new comment
export async function POST(req) {
  try {
    await dbConnect();
    const { ticket_id, created_by, comment } = await req.json();

    if (!ticket_id || !created_by || !comment) {
      return NextResponse.json(
        { error: "ticket_id, created_by, and comment are required" },
        { status: 400 }
      );
    }

    // Ensure ticket exists
    const ticket = await Ticket.findById(ticket_id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Ensure user exists
    const user = await User.findById(created_by);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newComment = await Comment.create({
      ticket: ticket_id,
      created_by,
      comment,
    });

    // Populate before returning
    const populatedComment = await newComment.populate("created_by", "username email");

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
