"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post("/api/customer-signin-api", form);
      setMessage(res.data.message);

      if (res.data.role === "Customer") {
        // ✅ Store user email in localStorage for authentication
        if (typeof window !== "undefined") {
          localStorage.setItem("userEmail", form.email);
        }
        
        setMessage("Signin successful! Redirecting...");
        setTimeout(() => router.push("/customer_payment_dashboard"), 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="shadow-lg p-4 p-md-5 rounded w-100"
        style={{ maxWidth: 600 }}
      >
        <h4 className="mb-4 text-center titleColor text-uppercase">
          Sign In
        </h4>

        {message && (
          <div className={`alert ${message.includes("successful") ? "alert-success" : "alert-info"}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="fw-bold">Email:</label>
            <input
              type="email"
              className="form-control shadow-none p-2"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div className="mb-3">
            <label className="fw-bold">Password:</label>
            <input
              type="password"
              className="form-control shadow-none p-2"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <button 
            type="submit" 
            className="btn primaryColor  rounded w-100"
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
      </div>
    </div>
  );
}