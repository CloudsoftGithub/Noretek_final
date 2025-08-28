"use client";

import ComplaintForm from "@/MainComponent/ComplaintForm";
import SupportContact from "@/MainComponent/SupportContact";
import React, { useState } from "react";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("complaint");
  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'success', 'error'
  const currentUser = { user_id: 1, name: "John Doe", email: "john@example.com" };

  const submitComplaint = async (complaintData) => {
    try {
      setSubmissionStatus(null);
      
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: complaintData.subject,
          message: complaintData.message,
          complaint_type: complaintData.complaint_type || "meter_issue",
          urgency: complaintData.urgency || "medium",
          customer_id: currentUser.user_id,
          customer_name: currentUser.name,
          customer_email: currentUser.email,
        }),
      });

      if (response.ok) {
        setSubmissionStatus('success');
        // Reset form or show success message
        alert("Your complaint has been submitted successfully! Our support team will contact you shortly.");
      } else {
        setSubmissionStatus('error');
        alert("Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setSubmissionStatus('error');
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Customer Support Center</h2>
              <p className="mb-0">Report meter issues or token purchase problems</p>
            </div>
            
            <div className="card-body">
              {/* Status Messages */}
              {submissionStatus === 'success' && (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Complaint submitted successfully! Our team will contact you soon.
                </div>
              )}
              
              {submissionStatus === 'error' && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Failed to submit complaint. Please try again or contact support directly.
                </div>
              )}

              {/* Navigation Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "complaint" ? "active" : ""}`}
                    onClick={() => setActiveTab("complaint")}
                  >
                    <i className="bi bi-chat-dots me-2"></i>
                    Report Issue
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "contact" ? "active" : ""}`}
                    onClick={() => setActiveTab("contact")}
                  >
                    <i className="bi bi-telephone me-2"></i>
                    Contact Support
                  </button>
                </li>
              </ul>

              {/* Complaint Form Tab */}
              {activeTab === "complaint" && (
                <div>
                  <div className="text-center mb-4">
                    <i className="bi bi-tools" style={{ fontSize: "3rem", color: "#0d6efd" }}></i>
                    <h3>Report Meter Issue</h3>
                    <p className="text-muted">Fill out the form below to submit your complaint</p>
                  </div>
                  
                  <ComplaintForm onSubmit={submitComplaint} />
                </div>
              )}

              {/* Contact Support Tab */}
              {activeTab === "contact" && (
                <SupportContact />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}