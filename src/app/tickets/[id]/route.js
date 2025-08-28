import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [tickets] = await db.execute(
      `SELECT t.*, u.name as created_by_name, c.name as category_name
       FROM support_ticket t
       LEFT JOIN users u ON t.created_by = u.user_id
       LEFT JOIN support_category c ON t.category_id = c.category_id
       WHERE t.ticket_id = ?`,
      [id]
    );
    
    if (tickets.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    return NextResponse.json(tickets[0]);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Error fetching ticket' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, priority, category_id, title, description } = body;

    await db.execute(
      `UPDATE support_ticket
       SET status = COALESCE(?, status),
           priority = COALESCE(?, priority),
           category_id = COALESCE(?, category_id),
           title = COALESCE(?, title),
           description = COALESCE(?, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE ticket_id = ?`,
      [status, priority, category_id, title, description, id]
    );

    return NextResponse.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Error updating ticket' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await db.execute(
      'DELETE FROM support_ticket WHERE ticket_id = ?',
      [id]
    );

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Error deleting ticket' }, { status: 500 });
  }
}