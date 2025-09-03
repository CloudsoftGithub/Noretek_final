// /src/app/customer-signin/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [submitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch("/api/customer-signin-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage("Signin successful! Redirecting...");
        setMessageType("success");
        
        // Store user data in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userName", data.user.name);
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userRole", data.user.role);
        }
        
        setTimeout(() => {
          // Check role with case-insensitive comparison
          if (data.user.role.toLowerCase() === "customer") {
            router.push("/customer_payment_dashboard");
          } else {
            router.push("/dashboard");
          }
        }, 2000);
      } else {
        setMessage(data.message || "Login failed");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Network error. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="shadow-lg p-4 p-md-5 rounded w-100 bg-white"
        style={{ maxWidth: 500 }}
      >
        <h4 className="mb-4 text-center titleColor text-uppercase fw-bold">
          Customer Sign In
        </h4>

        {message && (
          <div className={`alert ${messageType === "success" ? "alert-success" : "alert-danger"} mb-3`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="fw-bold text-muted">Email:</label>
            <input
              type="email"
              className="form-control shadow-none p-2"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="mb-3">
            <label className="fw-bold text-muted">Password:</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control shadow-none p-2 pe-5"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={submitting}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                style={{ padding: "0.75rem" }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={submitting}
              >
                {showPassword ? (
                  <i className="bi bi-eye-slash"></i>
                ) : (
                  <i className="bi bi-eye"></i>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
              />
              <label className="form-check-label text-muted small" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            
            <Link 
              href="/forgot-password" 
              className="text-primary small text-decoration-none"
            >
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-muted mb-0">
            Don't have an account?{" "}
            <Link 
              href="/customer-signup" 
              className="text-primary text-decoration-none fw-bold"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}