"use client";

import React, { useState, useEffect } from "react";

export default function AccountReadPage() {
  // Login state
  const [loginData, setLoginData] = useState({
    userId: "",
    password: "",
    company: "Noretek Energy",
  });
  const [token, setToken] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Table state
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("customerId");
  const [sortField, setSortField] = useState("customerId");
  const [sortOrder, setSortOrder] = useState("asc");

  // Initialize token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);
 useEffect(() => {
    if (token) fetchAccounts();
  }, [token, pagination.pageNumber, pagination.pageSize, searchTerm, searchField, sortField, sortOrder]);
  // Fetch accounts when token or filters change
  useEffect(() => {
    if (token) fetchAccounts();
  }, [token, pagination.pageNumber, pagination.pageSize, searchTerm, searchField, sortField, sortOrder]);

  // Login handlers
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("http://47.107.69.132:9400/API/User/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data?.result?.token) {
        localStorage.setItem("token", data.result.token);
        setToken(data.result.token);
      } else {
        setLoginError(data?.message || "Login failed. Check credentials.");
      }
    } catch (err) {
      setLoginError("An error occurred: " + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Table functions
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const payload = {
        [searchField]: searchTerm,
        createDateRange: [],
        updateDateRange: [],
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        company: "Noretek Energy",
        searchTerm: searchTerm,
        sortField: sortField,
        sortOrder: sortOrder,
      };

      const res = await fetch("http://47.107.69.132:9400/API/Account/Read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setAccounts(data?.result?.data || []);
      
      if (data?.result?.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.result.pagination.totalPages || 1,
          totalRecords: data.result.pagination.totalRecords || 0,
        }));
      }
    } catch (err) {
      setAccounts([]);
      console.error("Error fetching accounts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, pageNumber: newPage }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="container mt-5">
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .card {
          border: none;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .card-header {
          border-bottom: 1px solid rgba(0,0,0,0.1);
          padding: 1rem 1.5rem;
        }
        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
          border-color: #80bdff;
        }
        .btn {
          border-radius: 5px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn:disabled {
          opacity: 0.65;
        }
        .table th {
          border-top: none;
          font-weight: 600;
          color: 495057;
          background-color: #f8f9fa;
        }
        .alert {
          border: none;
          border-radius: 5px;
          padding: 0.75rem 1.25rem;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        .input-group {
          width: auto;
        }
      `}</style>

      {/* LOGIN FORM */}
      {!token && (
        <div className="card mb-5 shadow">
          <div className="card-header bg-dark text-white text-center">
            <h4>Login to Get Token</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label">User ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="userId"
                  value={loginData.userId}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  className="form-control"
                  name="company"
                  value={loginData.company}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loginLoading}
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
              {loginError && (
                <div className="alert alert-danger mt-3">{loginError}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT TABLE */}
      {token && (
        <div className="card shadow">
          <div className="card-header bg-secondary text-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h5 className="mb-0">Account List</h5>
              <div className="d-flex flex-wrap gap-2">
                <form onSubmit={handleSearch} className="d-flex">
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      <option value="customerId">Customer ID</option>
                      <option value="meterId">Meter ID</option>
                      <option value="tariffId">Tariff ID</option>
                    </select>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Search by ${searchField.replace(/([A-Z])/g, ' $1').trim()}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                      Search
                    </button>
                  </div>
                </form>
                <select
                  className="form-select"
                  value={`${sortField}:${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split(':');
                    setSortField(field);
                    setSortOrder(order);
                  }}
                >
                  <option value="customerId:asc">Sort by Customer ID (A-Z)</option>
                  <option value="customerId:desc">Sort by Customer ID (Z-A)</option>
                  <option value="meterId:asc">Sort by Meter ID (A-Z)</option>
                  <option value="meterId:desc">Sort by Meter ID (Z-A)</option>
                  <option value="tariffId:asc">Sort by Tariff ID (A-Z)</option>
                  <option value="tariffId:desc">Sort by Tariff ID (Z-A)</option>
                  <option value="createDate:desc">Newest First</option>
                  <option value="createDate:asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body table-responsive">
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("customerId")} className="cursor-pointer">
                        Customer ID {sortField === "customerId" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => handleSort("meterId")} className="cursor-pointer">
                        Meter ID {sortField === "meterId" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th>Site</th>
                      <th onClick={() => handleSort("tariffId")} className="cursor-pointer">
                        Tariff ID {sortField === "tariffId" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th>Remark</th>
                      <th>Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length > 0 ? (
                      accounts.map((account, index) => (
                        <tr key={index}>
                          <td>{account.customerId}</td>
                          <td>{account.meterId}</td>
                          <td>{account.site}</td>
                          <td>{account.tariffId}</td>
                          <td>{account.remark}</td>
                          <td>{account.company}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No accounts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Pagination controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-3">
                  <div className="text-nowrap">
                    Showing {(pagination.pageNumber - 1) * pagination.pageSize + 1} to{' '}
                    {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalRecords)} of{' '}
                    {pagination.totalRecords} accounts
                  </div>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handlePageChange(pagination.pageNumber - 1)}
                      disabled={pagination.pageNumber === 1 || loading}
                    >
                      Previous
                    </button>
                    <span className="btn btn-light disabled">
                      Page {pagination.pageNumber} of {pagination.totalPages}
                    </span>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handlePageChange(pagination.pageNumber + 1)}
                      disabled={pagination.pageNumber === pagination.totalPages || loading}
                    >
                      Next
                    </button>
                  </div>
                  <div className="form-group">
                    <select
                      className="form-select"
                      value={pagination.pageSize}
                      onChange={(e) => setPagination(prev => ({
                        ...prev,
                        pageSize: Number(e.target.value),
                        pageNumber: 1
                      }))}
                      disabled={loading}
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}