// src/app/support/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('/api/support')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch tickets');
        }
        return res.json();
      })
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tickets:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container mt-4">Loading tickets...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Support Tickets</h1>
        <Link href="/support/create" className="btn btn-primary">
          Create New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="alert alert-info">
          No support tickets found. <Link href="/support/create">Create your first ticket</Link>
        </div>
      ) : (
        <div className="row">
          {tickets.map(ticket => (
            <div key={ticket._id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{ticket.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    Status: <span className={`badge bg-${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                  </h6>
                  <p className="card-text">{ticket.description?.substring(0, 100)}...</p>
                  <div className="text-muted small">
                    <div>Category: {ticket.category?.name || 'Uncategorized'}</div>
                    <div>Priority: {ticket.priority}</div>
                    <div>Created by: {ticket.created_by?.username || 'Unknown'}</div>
                    <div>Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="card-footer">
                  <Link href={`/support/${ticket._id}`} className="btn btn-sm btn-outline-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function for status colors
function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'open': return 'primary';
    case 'in progress': return 'info';
    case 'resolved': return 'success';
    case 'closed': return 'secondary';
    default: return 'secondary';
  }
}