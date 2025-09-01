// MainComponent/UserList.jsx
"use client";
import { useEffect, useState } from "react";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/app/api/customer-signup-api")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-center">User List</h3>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id}>
              <td>{i + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
