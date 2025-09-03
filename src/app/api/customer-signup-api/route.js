// /src/app/api/customer-signup-api/route.js
import { connectDB } from "@/lib/mongodb";
import CustomerTable from "@/models/CustomerTable";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    const { 
      name, 
      email, 
      password, 
      confirmPassword, 
      phone, 
      address, 
      certifiName, 
      certifiNo, 
      propertyName, 
      propertyUnit 
    } = await req.json();

    console.log("Received signup data:", { email, name });

    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'phone', 'address', 'certifiName', 'certifiNo', 'propertyName', 'propertyUnit'];
    const missingFields = requiredFields.filter(field => !eval(field));
    
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return new Response(
        JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      console.log("Password too short");
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Passwords don't match");
      return new Response(
        JSON.stringify({ error: 'Passwords do not match' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user already exists
    const existingUser = await CustomerTable.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (existingUser) {
      console.log("User already exists:", email);
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Hash password
    console.log("Hashing password...");
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new customer
    console.log("Creating new customer...");
    const newCustomer = new CustomerTable({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim(),
      certifiName: certifiName.trim(),
      certifiNo: certifiNo.trim(),
      propertyName: propertyName,
      propertyUnit: propertyUnit,
      role: 'customer',
      isActive: true,
      accountStatus: 'active'
    });

    const savedCustomer = await newCustomer.save();
    console.log("Customer created successfully:", savedCustomer.email);

    // Return user data without password
    const userResponse = {
      id: savedCustomer._id,
      name: savedCustomer.name,
      email: savedCustomer.email,
      phone: savedCustomer.phone,
      role: savedCustomer.role,
      message: 'Customer created successfully'
    };

    return new Response(
      JSON.stringify(userResponse),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error. Please try again later.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Export other HTTP methods
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function PUT() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function DELETE() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}