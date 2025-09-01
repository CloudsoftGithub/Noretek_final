"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function TicketDetail({ params }) {
  const router = useRouter();
  const { id } = params;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchTicket();
    fetchComments();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ticket");
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?ticket_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: id,
          created_by: "64fexampleuserid", // replace with logged-in user
          comment: newComment,
        }),
      });

      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!ticket) return <div className="alert alert-warning">Ticket not found</div>;

  return (
    <>
      <Head>
        <title>Ticket - {ticket.title}</title>
      </Head>

      <div className="container py-4">
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => router.back()}
        >
          ← Back to Dashboard
        </button>

        <div className="row">
          {/* Ticket Details */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{ticket.title}</h5>
                <div>
                  <span
                    className={`badge bg-${getPriorityVariant(ticket.priority)} me-2`}
                  >
                    {ticket.priority}
                  </span>
                  <span className={`badge bg-${getStatusVariant(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <p>{ticket.description}</p>
                <div className="text-muted small">
                  <div>Created by: {ticket.created_by?.username}</div>
                  <div>Category: {ticket.category?.name}</div>
                  <div>
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                  {ticket.updatedAt && (
                    <div>
                      Last updated: {new Date(ticket.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="card mt-4">
              <div className="card-header">
                <h6 className="mb-0">Comments</h6>
              </div>
              <ul className="list-group list-group-flush">
                {comments.map((c) => (
                  <li key={c._id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <strong>{c.created_by?.username}</strong>
                      <small className="text-muted">
                        {new Date(c.created_at).toLocaleString()}
                      </small>
                    </div>
                    <p className="mb-0 mt-1">{c.comment}</p>
                  </li>
                ))}
                {comments.length === 0 && (
                  <li className="list-group-item">
                    <p className="text-muted text-center mb-0">No comments yet</p>
                  </li>
                )}
              </ul>
              <div className="card-footer">
                <div className="mb-2">
                  <label className="form-label">Add Comment</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                  />
                </div>
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Actions */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Ticket Actions</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Change Status</label>
                  <select
                    className="form-select"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary">Assign to Me</button>
                  <button className="btn btn-outline-secondary">Add Attachment</button>
                  <button className="btn btn-outline-danger">Delete Ticket</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ Helper functions for badge colors
function getPriorityVariant(priority) {
  switch (priority?.toLowerCase()) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "success";
    case "critical":
      return "dark";
    default:
      return "secondary";
  }
}

function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case "open":
      return "primary";
    case "in_progress":
      return "info";
    case "resolved":
      return "success";
    case "closed":
      return "secondary";
    default:
      return "secondary";
  }
}
