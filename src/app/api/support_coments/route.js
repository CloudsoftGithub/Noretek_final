import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; // ensure you have a db connection helper
import SupportComment from "@/models/SupportComment";
import User from "@/models/User"; // if you already have a User model

// GET all comments for a ticket
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const ticket_id = searchParams.get("ticket_id");

  if (!ticket_id) {
    return NextResponse.json({ error: "ticket_id required" }, { status: 400 });
  }

  try {
    const comments = await SupportComment.find({ ticket_id })
      .populate("user_id", "name") // get user name only
      .sort({ created_at: 1 });

    // Reshape response to match your SQL version
    const result = comments.map((c) => ({
      comment_id: c._id,
      comment: c.comment,
      created_at: c.created_at,
      user_name: c.user_id?.name || "Unknown",
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST add new comment
export async function POST(req) {
  await dbConnect();
  try {
    const { ticket_id, user_id, comment } = await req.json();
    if (!ticket_id || !user_id || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newComment = await SupportComment.create({ ticket_id, user_id, comment });

    return NextResponse.json({ comment_id: newComment._id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT update comment
export async function PUT(req) {
  await dbConnect();
  try {
    const { comment_id, comment } = await req.json();
    if (!comment_id || !comment) {
      return NextResponse.json({ error: "comment_id and comment required" }, { status: 400 });
    }

    await SupportComment.findByIdAndUpdate(comment_id, { comment }, { new: true });

    return NextResponse.json({ message: "Comment updated" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a comment
export async function DELETE(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const comment_id = searchParams.get("comment_id");

    if (!comment_id) {
      return NextResponse.json({ error: "comment_id required" }, { status: 400 });
    }

    await SupportComment.findByIdAndDelete(comment_id);

    return NextResponse.json({ message: "Comment deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
