"use client";
import React, { useState } from "react";

export default function ComplaintForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    subject: "",
    complaint_type: "meter_issue",
    urgency: "medium",
    message: "",
  });

  const complaintTypes = [
    { id: "meter_issue", name: "Meter Malfunction" },
    { id: "token_purchase", name: "Token Purchase Problem" },
    { id: "billing", name: "Billing Issue" },
    { id: "account", name: "Account Problem" },
    { id: "other", name: "Other Issue" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
    // Reset form after submission
    setFormData({
      subject: "",
      complaint_type: "meter_issue",
      urgency: "medium",
      message: "",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="subject" className="form-label">
                Issue Summary <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="complaint_type" className="form-label">
                Issue Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="complaint_type"
                name="complaint_type"
                value={formData.complaint_type}
                onChange={handleChange}
                required
              >
                {complaintTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="urgency" className="form-label">
                Urgency Level <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                required
              >
                <option value="low">Low - Can wait 2-3 days</option>
                <option value="medium">Medium - Need within 24 hours</option>
                <option value="high">High - Urgent (meter not working)</option>
                <option value="critical">Critical - No power/emergency</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="meter_number" className="form-label">
                Meter Number (if applicable)
              </label>
              <input
                type="text"
                className="form-control"
                id="meter_number"
                name="meter_number"
                onChange={handleChange}
                placeholder="Enter your meter number"
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              Detailed Description <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              placeholder="Please describe your issue in detail. Include:
- Meter model/number
- Error messages displayed
- When the problem started
- What you've tried so far
- Any recent token purchases"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="contact_preference" className="form-label">
              Preferred Contact Method
            </label>
            <select
              className="form-select"
              id="contact_preference"
              name="contact_preference"
              onChange={handleChange}
            >
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary btn-lg">
              <i className="bi bi-send me-2"></i>
              Submit Complaint
            </button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              After submission, our support team will review your complaint, 
              create a ticket, and contact you within 24 hours.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}