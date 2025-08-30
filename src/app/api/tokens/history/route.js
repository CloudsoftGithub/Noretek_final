import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    const client = await clientPromise;
    const db = client.db("noretek_energy_db");
    
    const tokens = await db.collection('tokens')
      .find({ customerName: email })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ tokens });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}