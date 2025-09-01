// app/api/customer-signup-api/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await db;
    const usersCollection = client.db().collection('users');
    
    // Fetch all users from the database
    const users = await usersCollection.find({}).toArray();
    
    // Convert MongoDB ObjectId to string for serialization
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? user.createdAt.toISOString() : null
    }));

    return NextResponse.json(serializedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await db;
    const usersCollection = client.db().collection('users');
    
    const userData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password (you'll need to implement this)
    // const hashedPassword = await hashPassword(userData.password);
    
    // Create new user
    const newUser = {
      ...userData,
      // password: hashedPassword,
      role: userData.role || 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: result.insertedId 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}