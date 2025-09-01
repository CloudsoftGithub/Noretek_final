// MainComponent/UserList.jsx
"use client";
import { useEffect, useState } from "react";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/customer-signup-api");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Users</h5>
          <p className="mb-0">{error}</p>
          <button 
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center" role="alert">
          <h5>No Users Found</h5>
          <p className="mb-0">There are no registered users in the system yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">User List</h3>
        <span className="badge bg-primary">
          {users.length} user{users.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id || user.id || index}>
                <td className="fw-bold">{index + 1}</td>
                <td>{user.name || 'N/A'}</td>
                <td>
                  <a href={`mailto:${user.email}`} className="text-decoration-none">
                    {user.email}
                  </a>
                </td>
                <td>
                  {user.phone ? (
                    <a href={`tel:${user.phone}`} className="text-decoration-none">
                      {user.phone}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{user.address || 'N/A'}</td>
                <td>
                  <span className={`badge ${
                    user.role === 'admin' ? 'bg-danger' : 
                    user.role === 'customer' ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {user.role || 'customer'}
                  </span>
                </td>
                <td>
                  {user.createdAt ? (
                    new Date(user.createdAt).toLocaleDateString()
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-muted small">
        <p className="mb-0">Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}