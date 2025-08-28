"use client";
import React, { useState, useEffect } from "react";

export default function TicketForm({
  onSave,
  currentUser,
  editingTicket,
  setEditingTicket,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Low",
    status: "Open",
    category_id: 1,
  });

  useEffect(() => {
    if (editingTicket) {
      setForm(editingTicket);
    } else {
      setForm({
        title: "",
        description: "",
        priority: "Low",
        status: "Open",
        category_id: 1,
      });
    }
  }, [editingTicket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="row g-2">
        <div className="col">
          <input
            className="form-control"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="col">
          <select
            className="form-select"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
        <div className="col">
          <button className="btn btn-primary" type="submit">
            {editingTicket ? "Update Ticket" : "Add Ticket"}
          </button>
          {editingTicket && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setEditingTicket(null)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
