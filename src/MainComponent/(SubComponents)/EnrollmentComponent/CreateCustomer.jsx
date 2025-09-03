"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerSignUp() {
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [uniqueProperties, setUniqueProperties] = useState([]);
  const [submitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    certifiName: "",
    certifiNo: "",
    propertyName: "",
    propertyUnit: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsSubmitting(true);

    // Basic validation
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/customer-signup-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || "Signup successful! Redirecting to login...");
        setMessageType("success");
        setTimeout(() => router.push("/customer-signin"), 2000);
      } else {
        setMessage(data.error || "Error occurred during signup");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("Server error. Please try again later.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch property units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch("/api/property_unit");
        if (res.ok) {
          const data = await res.json();
          setUnits(data);

          // Extract unique properties
          const uniqueProps = [
            ...new Map(
              data.map((u) => [u.property_id._id, u.property_id])
            ).values(),
          ];
          setUniqueProperties(uniqueProps);
        } else {
          console.error("Failed to fetch property units");
        }
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchUnits();
  }, []);

  // Filter units when property changes
  useEffect(() => {
    if (!form.propertyName) {
      setFilteredUnits([]);
      return;
    }
    setFilteredUnits(
      units.filter((u) => u.property_id._id === form.propertyName)
    );
  }, [form.propertyName, units]);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="shadow-lg my-4 p-md-5 p-4 rounded w-100"
        style={{ maxWidth: 800 }}
      >
        <h4 className="text-center titleColor font-monospace fw-bold text-uppercase">
          Customer Sign Up
        </h4>

        {message && (
          <div className={`alert ${messageType === "success" ? "alert-success" : "alert-danger"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <p className="fw-bold titleColor"> Customer Information</p>
            <hr className="mb-0 mt-0" />
            
            {/* Name */}
            <div className="col-md-6">
              <div className="mb-2">
                <label className="fw-bold text-muted">Name:</label>
                <input
                  type="text"
                  className="form-control shadow-none p-2"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-md-6">
              <div className="mb-2">
                <label className="fw-bold text-muted">Email</label>
                <input
                  type="email"
                  className="form-control shadow-none p-2"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="col-md-6">
              <div className="mb-2">
                <label className="fw-bold text-muted">Phone:</label>
                <input
                  type="text"
                  className="form-control shadow-none p-2"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div className="col-md-6">
              <div className="mb-3 rounded">
                <label className="fw-bold text-muted">Role:</label>
                <input
                  className="form-control shadow-none p-2"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
            </div>

            {/* Password */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold text-muted">Password:</label>
                <input
                  type="password"
                  className="form-control shadow-none p-2"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold text-muted">Confirm Password:</label>
                <input
                  type="password"
                  className="form-control shadow-none p-2"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Certific Name */}
            <div className="col-md-6">
              <div className="mb-2">
                <label className="fw-bold text-muted">Certific Name:</label>
                <input
                  type="text"
                  className="form-control shadow-none p-2"
                  name="certifiName"
                  value={form.certifiName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Certific No */}
            <div className="col-md-6">
              <div className="mb-2">
                <label className="fw-bold text-muted">Certific No:</label>
                <input
                  type="text"
                  className="form-control shadow-none p-2"
                  name="certifiNo"
                  value={form.certifiNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="col-md-12">
              <div className="mb-2">
                <label className="fw-bold text-muted">Address:</label>
                <textarea
                  className="form-control shadow-none p-2"
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            {/* Property Info */}
            <p className="fw-bold titleColor"> Property Information</p>
            <hr />
            
            {/* Property Name */}
            <div className="col-md-6">
              <div className="mb-3 rounded">
                <label className="fw-bold">Property Name:</label>
                <select
                  className="form-select shadow-none p-2"
                  name="propertyName"
                  value={form.propertyName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Property</option>
                  {uniqueProperties.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.property_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Unit */}
            <div className="col-md-6">
              <div className="mb-3 rounded">
                <label className="fw-bold">Property Unit:</label>
                <select
                  className="form-select shadow-none p-2"
                  name="propertyUnit"
                  value={form.propertyUnit}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Unit</option>
                  {filteredUnits.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.unit_description} - Block {u.blockno}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn text-uppercase btn-outline-primary font-monospace primaryColor w-100 shadow-none"
            disabled={submitting}
          >
            {submitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}