"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  ListGroup,
} from "react-bootstrap";

export default function TicketDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (id) {
      fetchTicket();
      fetchComments();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${id}`);
      if (!response.ok) throw new Error("Failed to fetch ticket");
      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?ticket_id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: id,
          user_id: 1, // TODO: replace with actual authenticated user
          comment: newComment,
        }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;
  if (!ticket) return <Alert variant="warning">Ticket not found</Alert>;

  return (
    <>
      <Head>
        <title>Ticket #{ticket.ticket_id} - Support System</title>
      </Head>

      <Container className="py-4">
        <Button
          variant="outline-secondary"
          onClick={() => router.back()}
          className="mb-3"
        >
          ← Back to Dashboard
        </Button>

        <Row>
          <Col md={8}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{ticket.title}</h5>
                <div>
                  <Badge bg={getPriorityVariant(ticket.priority)} className="me-2">
                    {ticket.priority}
                  </Badge>
                  <Badge bg={getStatusVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <p>{ticket.description}</p>
                <div className="text-muted small">
                  <div>Created by: {ticket.created_by_name}</div>
                  <div>Category: {ticket.category_name}</div>
                  <div>
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </div>
                  {ticket.updated_at && (
                    <div>
                      Last updated: {new Date(ticket.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Comments Section */}
            <Card className="mt-4">
              <Card.Header>
                <h6 className="mb-0">Comments</h6>
              </Card.Header>
              <ListGroup variant="flush">
                {comments.map((comment) => (
                  <ListGroup.Item key={comment.comment_id}>
                    <div className="d-flex justify-content-between">
                      <strong>{comment.user_name}</strong>
                      <small className="text-muted">
                        {new Date(comment.created_at).toLocaleString()}
                      </small>
                    </div>
                    <p className="mb-0 mt-1">{comment.comment}</p>
                  </ListGroup.Item>
                ))}
                {comments.length === 0 && (
                  <ListGroup.Item>
                    <p className="text-muted text-center mb-0">
                      No comments yet
                    </p>
                  </ListGroup.Item>
                )}
              </ListGroup>
              <Card.Footer>
                <Form.Group>
                  <Form.Label>Add Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  className="mt-2"
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </Card.Footer>
            </Card>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Ticket Actions</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Change Status</Form.Label>
                  <Form.Select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="outline-primary">Assign to Me</Button>
                  <Button variant="outline-secondary">Add Attachment</Button>
                  <Button variant="outline-danger">Delete Ticket</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

// ✅ Helper functions
function getPriorityVariant(priority) {
  switch (priority) {
    case "High":
      return "danger";
    case "Medium":
      return "warning";
    case "Low":
      return "success";
    case "Critical":
      return "dark";
    default:
      return "secondary";
  }
}

function getStatusVariant(status) {
  switch (status) {
    case "Open":
      return "primary";
    case "In Progress":
      return "info";
    case "Resolved":
      return "success";
    case "Closed":
      return "secondary";
    default:
      return "secondary";
  }
}
