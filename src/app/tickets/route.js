import { NextResponse } from 'next/server';
import db from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let sql = `
      SELECT t.*, u.name as created_by_name, c.name as category_name
      FROM support_ticket t
      LEFT JOIN users u ON t.created_by = u.user_id
      LEFT JOIN support_category c ON t.category_id = c.category_id
    `;
    
    const params = [];
    
    if (user_id && role === 'Customer') {
      sql += ' WHERE t.created_by = ?';
      params.push(user_id);
    }
    
    if (status) {
      sql += params.length ? ' AND' : ' WHERE';
      sql += ' t.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY t.created_at DESC';
    
    const [tickets] = await db.execute(sql, params);
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Error fetching tickets' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, category_id, priority, created_by } = body;

    if (!title || !created_by) {
      return NextResponse.json({ error: 'Title and created_by are required' }, { status: 400 });
    }

    const [result] = await db.execute(
      `INSERT INTO support_ticket (title, description, category_id, priority, status, created_by)
       VALUES (?, ?, ?, ?, 'Open', ?)`,
      [title, description, category_id, priority || 'Low', created_by]
    );

    return NextResponse.json({ 
      message: 'Ticket created successfully', 
      ticket_id: result.insertId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Error creating ticket' }, { status: 500 });
  }
}