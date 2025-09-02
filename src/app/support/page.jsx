// src/app/support/page.jsx (React component)
"use client";
import { useEffect, useState } from "react";

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/support') // Now calls /api/support instead of /support
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tickets:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading tickets...</div>;

  return (
    <div className="container">
      <h1>Support Tickets</h1>
      {tickets.map(ticket => (
        <div key={ticket._id} className="card mb-3">
          <div className="card-body">
            <h5>{ticket.title}</h5>
            <p>{ticket.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}