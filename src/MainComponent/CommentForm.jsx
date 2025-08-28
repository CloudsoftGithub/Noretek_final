"use client";
import React, { useState } from 'react';

export default function CommentForm({ ticketId, userId, onAdd, onClose }) {
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await onAdd({ ticket_id: ticketId, user_id: userId, comment });
    setComment('');
    if (onClose) onClose();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Add Comment</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your comment here..."
              required
            />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Add Comment
            </button>
            {onClose && (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}