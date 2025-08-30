import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const tokenData = await request.json();
    
    const client = await clientPromise;
    const db = client.db("noretek_energy_db");
    
    await db.collection('tokens').insertOne({
      ...tokenData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}