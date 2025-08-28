"use client";
import PriorityBadge from "@/MainComponent/PriorityBadge";
import StatusBadge from "@/MainComponent/StatusBadge";
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tickets");
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
  });

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
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

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTickets(), fetchComplaints()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setStats({
      totalTickets: tickets.length,
      openTickets: tickets.filter(
        (t) => t.status === "Open" || t.status === "In Progress"
      ).length,
      resolvedTickets: tickets.filter(
        (t) => t.status === "Resolved" || t.status === "Closed"
      ).length,
      totalComplaints: complaints.length,
      pendingComplaints: complaints.filter((c) => c.status === "pending").length,
    });
  }, [tickets, complaints]);

  if (loading) {
    return (
      <div className="container mt-4 text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h2 className="mb-0">Admin Dashboard - Overview</h2>
          <p className="mb-0">
            View all customer complaints and support tickets (Read Only)
          </p>
        </div>

        <div className="card-body">
          {/* Statistics */}
          <div className="row mb-4">
            <div className="col-md-2 col-6 mb-3">
              <div className="card text-center border-primary">
                <div className="card-body">
                  <h3 className="text-primary">{stats.totalTickets}</h3>
                  <span className="text-muted">Total Tickets</span>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card text-center border-warning">
                <div className="card-body">
                  <h3 className="text-warning">{stats.openTickets}</h3>
                  <span className="text-muted">Open Tickets</span>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card text-center border-success">
                <div className="card-body">
                  <h3 className="text-success">{stats.resolvedTickets}</h3>
                  <span className="text-muted">Resolved</span>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card text-center border-info">
                <div className="card-body">
                  <h3 className="text-info">{stats.totalComplaints}</h3>
                  <span className="text-muted">Total Complaints</span>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card text-center border-danger">
                <div className="card-body">
                  <h3 className="text-danger">{stats.pendingComplaints}</h3>
                  <span className="text-muted">Pending Complaints</span>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card text-center border-secondary">
                <div className="card-body">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={loadAllData}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tickets" ? "active" : ""}`}
                onClick={() => setActiveTab("tickets")}
              >
                <i className="bi bi-ticket-detailed me-2"></i>
                Support Tickets ({tickets.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "complaints" ? "active" : ""
                }`}
                onClick={() => setActiveTab("complaints")}
              >
                <i className="bi bi-chat-dots me-2"></i>
                Customer Complaints ({complaints.length})
              </button>
            </li>
          </ul>

          {/* Tickets Tab */}
          {activeTab === "tickets" && (
            <div>
              <h4>All Support Tickets</h4>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket #</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Customer</th>
                      <th>Created At</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.ticket_id}>
                        <td>
                          <strong>#{ticket.ticket_id}</strong>
                        </td>
                        <td>
                          <strong>{ticket.title}</strong>
                          {ticket.description && (
                            <small className="text-muted d-block">
                              {ticket.description.substring(0, 60)}...
                            </small>
                          )}
                        </td>
                        <td>{ticket.category_name}</td>
                        <td>
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td>
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td>{ticket.created_by_name}</td>
                        <td>{ticket.customer_name || "N/A"}</td>
                        <td>
                          <small>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              fetchComments(ticket.ticket_id);
                            }}
                          >
                            <i className="bi bi-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tickets.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-inbox display-4"></i>
                    <p>No support tickets found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === "complaints" && (
            <div>
              <h4>Customer Complaints</h4>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Complaint #</th>
                      <th>Customer</th>
                      <th>Issue Type</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Received</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr key={complaint.id}>
                        <td>
                          <strong>#{complaint.id}</strong>
                        </td>
                        <td>
                          <strong>{complaint.customer_name}</strong>
                          <br />
                          <small className="text-muted">
                            {complaint.customer_email}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-info text-capitalize">
                            {complaint.complaint_type?.replace("_", " ") ||
                              "other"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge bg-${
                              complaint.urgency === "critical"
                                ? "danger"
                                : complaint.urgency === "high"
                                ? "warning"
                                : complaint.urgency === "medium"
                                ? "info"
                                : "secondary"
                            }`}
                          >
                            {complaint.urgency}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge bg-${
                              complaint.status === "pending"
                                ? "warning"
                                : complaint.status === "processed"
                                ? "success"
                                : "secondary"
                            }`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                        <td>
                          <small>
                            {new Date(
                              complaint.created_at
                            ).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => {
                              alert(
                                `Complaint Details:\n\nSubject: ${
                                  complaint.subject
                                }\n\nMessage: ${
                                  complaint.message
                                }\n\nMeter: ${
                                  complaint.meter_number || "N/A"
                                }`
                              );
                            }}
                          >
                            <i className="bi bi-info-circle"></i> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {complaints.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-chat-dots display-4"></i>
                    <p>No customer complaints found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Ticket #{selectedTicket.ticket_id} - {selectedTicket.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTicket(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Title:</strong> {selectedTicket.title}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedTicket.description}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {selectedTicket.category_name}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Priority:</strong>{" "}
                      <PriorityBadge priority={selectedTicket.priority} />
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <StatusBadge status={selectedTicket.status} />
                    </p>
                    <p>
                      <strong>Created By:</strong>{" "}
                      {selectedTicket.created_by_name}
                    </p>
                    <p>
                      <strong>Customer:</strong>{" "}
                      {selectedTicket.customer_name || "N/A"}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(
                        selectedTicket.created_at
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {new Date(
                        selectedTicket.updated_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h6>Comments</h6>
                  {comments.length > 0 ? (
                    <div className="border rounded p-3">
                      {comments.map((comment) => (
                        <div
                          key={comment.comment_id}
                          className="mb-3 p-2 border-bottom"
                        >
                          <div className="d-flex justify-content-between">
                            <strong>{comment.user_name}</strong>
                            <small className="text-muted">
                              {new Date(
                                comment.created_at
                              ).toLocaleString()}
                            </small>
                          </div>
                          <p className="mb-0">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No comments yet</p>
                  )}
                </div>

                <div className="mt-4 alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Admin View Only:</strong> You can view details but
                  cannot modify them.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTicket(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
