// app/api/customer-signin-api/route.js
import { connectDB } from "@/lib/mongodb";
import CustomerTable from "@/models/CustomerTable";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Rate limiting setup
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export async function POST(req) {
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // Check rate limiting
  if (loginAttempts.has(clientIP)) {
    const attempts = loginAttempts.get(clientIP);
    if (attempts.count >= MAX_ATTEMPTS && now - attempts.lastAttempt < LOCKOUT_TIME) {
      return new Response(
        JSON.stringify({ 
          message: "Too many failed attempts. Please try again in 15 minutes." 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes in seconds
          }
        }
      );
    }
  }

  try {
    await connectDB();
    const { email, password } = await req.json();

    // Input validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ message: "Invalid email format" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find customer with case-insensitive email
    const customer = await CustomerTable.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password'); // Ensure password is included

    if (!customer) {
      // Update rate limiting
      const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      attempts.count += 1;
      attempts.lastAttempt = now;
      loginAttempts.set(clientIP, attempts);
      
      // Log failed attempt (in production, use a proper logging service)
      console.warn(`Failed login attempt for email: ${email} from IP: ${clientIP}`);
      
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if account is locked or suspended
    if (customer.accountStatus === 'locked' || customer.accountStatus === 'suspended') {
      return new Response(
        JSON.stringify({ 
          message: "Account is temporarily locked. Please contact support." 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify password
    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      // Update failed login count
      customer.failedLoginAttempts = (customer.failedLoginAttempts || 0) + 1;
      
      // Lock account after too many failed attempts
      if (customer.failedLoginAttempts >= MAX_ATTEMPTS) {
        customer.accountStatus = 'locked';
        customer.lockUntil = new Date(Date.now() + LOCKOUT_TIME);
      }
      
      await customer.save();
      
      // Update rate limiting
      const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      attempts.count += 1;
      attempts.lastAttempt = now;
      loginAttempts.set(clientIP, attempts);
      
      // Log failed attempt
      console.warn(`Failed password attempt for user: ${customer.email} from IP: ${clientIP}`);
      
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Reset failed login attempts on successful login
    if (customer.failedLoginAttempts > 0) {
      customer.failedLoginAttempts = 0;
      customer.accountStatus = 'active';
      customer.lockUntil = undefined;
      await customer.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: customer._id, 
        email: customer.email,
        role: customer.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      { expiresIn: '24h' }
    );

    // Log successful login
    console.log(`Successful login for user: ${customer.email} from IP: ${clientIP}`);

    // Prepare response data (exclude sensitive information)
    const userData = {
      id: customer._id,
      email: customer.email,
      name: customer.name,
      role: customer.role,
      meterId: customer.meterId,
      accountStatus: customer.accountStatus
    };

    return new Response(
      JSON.stringify({
        message: "Login successful",
        user: userData,
        token: token,
        expiresIn: 86400 // 24 hours in seconds
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
        }
      }
    );

  } catch (err) {
    console.error('Login error:', err);
    
    return new Response(
      JSON.stringify({ 
        message: "Internal server error. Please try again later." 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Clean up old login attempts periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of loginAttempts.entries()) {
    if (now - attempts.lastAttempt > LOCKOUT_TIME) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour