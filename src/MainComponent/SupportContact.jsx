"use client";
import React from "react";

export default function SupportContact() {
  const supportContacts = [
    {
      method: "Emergency Hotline",
      details: "+234 (0) 700-EMERGENCY",
      icon: "bi-telephone-fill",
      response: "24/7 for critical issues",
      description: "For meter emergencies and power outages"
    },
    {
      method: "Customer Support",
      details: "support@electriccompany.com",
      icon: "bi-envelope",
      response: "Within 24 hours",
      description: "General inquiries and complaints"
    },
    {
      method: "Technical Support",
      details: "tech@electriccompany.com",
      icon: "bi-wrench",
      response: "Within 2 hours",
      description: "Meter technical issues and token problems"
    },
    {
      method: "Billing Department",
      details: "billing@electriccompany.com",
      icon: "bi-credit-card",
      response: "Within 48 hours",
      description: "Payment and billing issues"
    }
  ];

  return (
    <div>
      <div className="text-center mb-4">
        <i className="bi bi-headset" style={{ fontSize: "3rem", color: "#0d6efd" }}></i>
        <h3>Contact Support</h3>
        <p className="text-muted">Direct contact channels for specific issues</p>
      </div>

      <div className="row">
        {supportContacts.map((contact, index) => (
          <div key={index} className="col-md-6 col-lg-3 mb-3">
            <div className="card h-100 text-center">
              <div className="card-body">
                <i className={`${contact.icon} display-6 text-primary mb-3`}></i>
                <h6 className="card-title">{contact.method}</h6>
                <p className="card-text text-muted small">{contact.details}</p>
                <small className="text-info d-block">{contact.response}</small>
                <small className="text-muted">{contact.description}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5>📞 Emergency Support Hotline</h5>
          <p className="text-danger">
            <strong>+234 (0) 700-EMERGENCY (363744629)</strong>
          </p>
          <p className="text-muted">
            Available 24/7 for critical meter issues, power outages, 
            and emergency situations.
          </p>

          <h5 className="mt-4">🕒 Regular Support Hours</h5>
          <ul className="list-unstyled">
            <li>📅 Monday - Friday: 8:00 AM - 6:00 PM</li>
            <li>📅 Saturday: 9:00 AM - 4:00 PM</li>
            <li>📅 Sunday: 10:00 AM - 2:00 PM</li>
          </ul>
          
          <h5 className="mt-4">📍 Office Location</h5>
          <p className="text-muted">
            123 Electricity Avenue, Power City<br/>
            Lagos, Nigeria<br/>
            <small>Visit us for in-person support</small>
          </p>
        </div>
      </div>
    </div>
  );
}