// /src/app/api/customer-signin-api/route.js
import { connectDB } from "@/lib/mongodb";
import CustomerTable from "@/models/CustomerTable";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Rate limiting setup
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export async function POST(req) {
  const clientIP = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
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
            'Retry-After': '900'
          }
        }
      );
    }
  }

  try {
    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected successfully');
    
    const { email, password } = await req.json();
    console.log('Login attempt for email:', email);

    // Input validation
    if (!email || !password) {
      console.log('Missing email or password');
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
      console.log('Invalid email format:', email);
      return new Response(
        JSON.stringify({ message: "Invalid email format" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find customer with case-insensitive email
    console.log('Searching for customer with email:', email);
    const customer = await CustomerTable.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password');

    if (!customer) {
      console.log('Customer not found for email:', email);
      
      // Update rate limiting
      const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      attempts.count += 1;
      attempts.lastAttempt = now;
      loginAttempts.set(clientIP, attempts);
      
      console.warn(`Failed login attempt for email: ${email} from IP: ${clientIP}`);
      
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Customer found:', customer.email);
    console.log('Checking account status:', customer.accountStatus);

    // Check if account is locked
    if (customer.accountStatus === 'locked') {
      if (customer.lockUntil && customer.lockUntil > new Date()) {
        const timeLeft = Math.ceil((customer.lockUntil - new Date()) / 60000);
        console.log('Account locked, time left:', timeLeft, 'minutes');
        return new Response(
          JSON.stringify({ 
            message: `Account is temporarily locked. Please try again in ${timeLeft} minutes.` 
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } else {
        // Reset lock if time has passed
        console.log('Resetting account lock');
        customer.accountStatus = 'active';
        customer.failedLoginAttempts = 0;
        customer.lockUntil = null;
      }
    }

    // Check if account is suspended
    if (customer.accountStatus === 'suspended') {
      console.log('Account suspended for email:', email);
      return new Response(
        JSON.stringify({ 
          message: "Account is suspended. Please contact support." 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify password
    console.log('Verifying password...');
    const match = await bcrypt.compare(password, customer.password);
    
    if (!match) {
      console.log('Password does not match for email:', email);
      
      // Update failed login count
      customer.failedLoginAttempts = (customer.failedLoginAttempts || 0) + 1;
      console.log('Failed login attempts:', customer.failedLoginAttempts);
      
      // Lock account after too many failed attempts
      if (customer.failedLoginAttempts >= MAX_ATTEMPTS) {
        console.log('Locking account due to too many failed attempts');
        customer.accountStatus = 'locked';
        customer.lockUntil = new Date(Date.now() + LOCKOUT_TIME);
      }
      
      await customer.save();
      
      // Update rate limiting
      const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      attempts.count += 1;
      attempts.lastAttempt = now;
      loginAttempts.set(clientIP, attempts);
      
      console.warn(`Failed password attempt for user: ${customer.email} from IP: ${clientIP}`);
      
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Password verified successfully');

    // Reset failed login attempts on successful login
    if (customer.failedLoginAttempts > 0) {
      console.log('Resetting failed login attempts');
      customer.failedLoginAttempts = 0;
      customer.accountStatus = 'active';
      customer.lockUntil = null;
      customer.lastLogin = new Date();
      await customer.save();
    }

    // Generate JWT token
    console.log('Generating JWT token');
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
      id: customer._id.toString(),
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
        expiresIn: 86400
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

// Clean up old login attempts periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of loginAttempts.entries()) {
    if (now - attempts.lastAttempt > LOCKOUT_TIME) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour