"use client";
import CommentForm from "@/MainComponent/CommentForm";
import CommentList from "@/MainComponent/CommentList";
import TicketTable from "@/MainComponent/TicketTable";
import StatusBadge from "@/MainComponent/StatusBadge";
import React, { useEffect, useState } from "react";

export default function SupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [complaints, setComplaints] = useState([]); // Customer complaints to convert to tickets
  const [loading, setLoading] = useState(true);
  const currentUser = { user_id: 2, name: "Support Agent", role: "Support" };

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Fetch customer complaints
  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints?status=pending");
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchComments = async (ticket_id) => {
    try {
      const res = await fetch(`/api/comments?ticket_id=${ticket_id}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Create ticket from complaint
  const createTicketFromComplaint = async (complaint) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: complaint.subject,
          description: complaint.message,
          category_id: getCategoryIdFromType(complaint.complaint_type),
          priority: complaint.urgency.toUpperCase(),
          created_by: currentUser.user_id,
          customer_id: complaint.customer_id,
          complaint_id: complaint.id // Link to original complaint
        }),
      });

      if (response.ok) {
        // Mark complaint as processed
        await fetch(`/api/complaints/${complaint.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "processed" })
        });
        
        alert("Ticket created successfully from complaint!");
        fetchTickets();
        fetchComplaints();
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket");
    }
  };

  const addComment = async ({ ticket_id, user_id, comment }) => {
    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id, user_id, comment }),
      });
      fetchComments(ticket_id);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const getCategoryIdFromType = (type) => {
    const categoryMap = {
      meter_issue: 2, // Technical
      token_purchase: 1, // Sales
      billing: 1,      // Sales
      account: 1,      // Sales
      other: 3         // Other
    };
    return categoryMap[type] || 3;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTickets(), fetchComplaints()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">Support Team Dashboard</h2>
              <p className="mb-0">Manage customer complaints and support tickets</p>
            </div>
            
            <div className="card-body">
              {/* Pending Complaints Section */}
              <div className="mb-5">
                <h4>Pending Customer Complaints</h4>
                {complaints.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-check-circle me-2"></i>
                    No pending complaints at the moment.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Complaint #</th>
                          <th>Customer</th>
                          <th>Issue Type</th>
                          <th>Urgency</th>
                          <th>Received</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map((complaint) => (
                          <tr key={complaint.id}>
                            <td>#{complaint.id}</td>
                            <td>
                              <div>
                                <strong>{complaint.customer_name}</strong>
                                <br />
                                <small className="text-muted">{complaint.customer_email}</small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {complaint.complaint_type?.replace('_', ' ') || 'Other'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${
                                complaint.urgency === 'critical' ? 'danger' :
                                complaint.urgency === 'high' ? 'warning' :
                                complaint.urgency === 'medium' ? 'info' : 'secondary'
                              }`}>
                                {complaint.urgency}
                              </span>
                            </td>
                            <td>
                              <small>{new Date(complaint.created_at).toLocaleDateString()}</small>
                            </td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  if (confirm("Create ticket for this complaint?")) {
                                    createTicketFromComplaint(complaint);
                                  }
                                }}
                              >
                                <i className="bi bi-plus-circle me-1"></i>
                                Create Ticket
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Tickets Section */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Support Tickets</h4>
                  <span className="badge bg-primary">Total: {tickets.length}</span>
                </div>

                <TicketTable
                  tickets={tickets}
                  onViewComments={(ticket) => {
                    setSelectedTicket(ticket);
                    fetchComments(ticket.ticket_id);
                    setShowComments(true);
                  }}
                  onStatusUpdate={updateTicketStatus}
                  userRole={currentUser.role}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Sidebar */}
      {showComments && selectedTicket && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <StatusBadge status={selectedTicket.status} />
                  Ticket #{selectedTicket.ticket_id}: {selectedTicket.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowComments(false);
                    setSelectedTicket(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p>{selectedTicket.description}</p>
                </div>
                
                <h6>Comments</h6>
                <CommentList comments={comments} />
                
                <CommentForm
                  ticketId={selectedTicket.ticket_id}
                  userId={currentUser.user_id}
                  onAdd={addComment}
                />
                
                <div className="mt-3">
                  <h6>Ticket Actions</h6>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-success"
                      onClick={() => updateTicketStatus(selectedTicket.ticket_id, 'In Progress')}
                    >
                      Mark In Progress
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => updateTicketStatus(selectedTicket.ticket_id, 'Resolved')}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateTicketStatus(selectedTicket.ticket_id, 'Closed')}
                    >
                      Close Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}