"use client";
import React from 'react';
import StatusBadge from './StatusBadge';

export default function TicketTable({ tickets, onEdit, onDelete, onViewComments, userRole = 'Customer' }) {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Created At</th>
            {userRole !== 'Customer' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id} style={{ cursor: 'pointer' }}>
              <td>{ticket.ticket_id}</td>
              <td>
                <strong>{ticket.title}</strong>
                {ticket.description && (
                  <small className="text-muted d-block">{ticket.description.substring(0, 100)}...</small>
                )}
              </td>
              <td>{ticket.category_name}</td>
              <td>
                <span className={`badge bg-${getPriorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </td>
              <td>
                <StatusBadge status={ticket.status} />
              </td>
              <td>{ticket.created_by_name}</td>
              <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
              {userRole !== 'Customer' && (
                <td>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onViewComments(ticket)}
                    >
                      Comments
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onEdit(ticket)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(ticket.ticket_id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {tickets.length === 0 && (
        <div className="text-center py-4 text-muted">
          No tickets found
        </div>
      )}
    </div>
  );
}