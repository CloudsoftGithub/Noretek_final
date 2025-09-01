"use client";
import { useEffect, useState } from "react";

export default function TicketDetailsPage({ params }) {
  const { id } = params; // ticket_id from URL
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Fetch ticket details
  useEffect(() => {
    if (!id) return;
    fetch(`/api/tickets/${id}`)
      .then((res) => res.json())
      .then((data) => setTicket(data))
      .catch((err) => console.error("Ticket fetch error:", err));
  }, [id]);

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    fetch(`/api/comments?ticket_id=${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Comments fetch error:", err));
  }, [id]);

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticket_id: id,
        comment: newComment,
        created_by: "64fexampleuserid", // TODO: replace with logged-in user id
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setComments([
        ...comments,
        {
          ...data,
          comment: newComment,
          created_by: { username: "Current User" },
          created_at: new Date(),
        },
      ]);
      setNewComment("");
    } else {
      alert("Error: " + data.error);
    }
  };

  if (!ticket) return <div className="container mt-4">Loading ticket...</div>;

  return (
    <div className="container mt-4">
      <h2>Ticket Details</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5>{ticket.title}</h5>
          <p>{ticket.description}</p>
          <p>
            <strong>Priority:</strong> {ticket.priority} <br />
            <strong>Status:</strong> {ticket.status} <br />
            <strong>Category:</strong> {ticket.category?.name} <br />
            <strong>Created By:</strong> {ticket.created_by?.username} <br />
            <strong>Created At:</strong>{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <h5>Comments</h5>
      <ul className="list-group mb-3">
        {comments.map((c) => (
          <li key={c._id} className="list-group-item">
            <strong>{c.created_by?.username}</strong>: {c.comment} <br />
            <small>{new Date(c.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>

      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAddComment}>
          Add
        </button>
      </div>
    </div>
  );
}
