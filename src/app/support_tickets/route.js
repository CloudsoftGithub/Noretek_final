import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET all tickets
export async function GET() {
  try {
    const [tickets] = await db.query(`
      SELECT t.*, u.name AS created_by_name, c.name AS category_name
      FROM support_ticket t
      LEFT JOIN users u ON t.created_by = u.user_id
      LEFT JOIN support_category c ON t.category_id = c.category_id
      ORDER BY t.created_at DESC
    `);
    return NextResponse.json(tickets);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create a new ticket
export async function POST(req) {
  try {
    const { title, description, category_id, priority, status, created_by } = await req.json();
    const [result] = await db.query(
      `INSERT INTO support_ticket 
      (title, description, category_id, priority, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, category_id, priority || "Low", status || "Open", created_by]
    );
    return NextResponse.json({ ticket_id: result.insertId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT update a ticket
export async function PUT(req) {
  try {
    const { ticket_id, title, description, category_id, priority, status } = await req.json();
    await db.query(
      `UPDATE support_ticket
       SET title=?, description=?, category_id=?, priority=?, status=?, updated_at=NOW()
       WHERE ticket_id=?`,
      [title, description, category_id, priority, status, ticket_id]
    );
    return NextResponse.json({ message: "Ticket updated" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a ticket
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ticket_id = searchParams.get("ticket_id");
    if (!ticket_id) return NextResponse.json({ error: "ticket_id required" }, { status: 400 });

    await db.query(`DELETE FROM support_ticket WHERE ticket_id=?`, [ticket_id]);
    return NextResponse.json({ message: "Ticket deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
