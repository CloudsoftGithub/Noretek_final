"use client";

import React, { useState, useEffect } from "react";

export default function CustomerReadPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("customerName");
  const [sortField, setSortField] = useState("customerName");
  const [sortOrder, setSortOrder] = useState("asc");

  // Initialize token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);
useEffect(() => {
  if (token) fetchCustomers();
}, [token, pagination.pageNumber, pagination.pageSize, searchTerm, searchField, sortField, sortOrder]);
  // Fetch customers when token or filters change
  useEffect(() => {
    if (token) fetchCustomers();
  }, [token, pagination.pageNumber, pagination.pageSize, searchTerm, searchField, sortField, sortOrder]);

  // Table functions
  const fetchCustomers = async () => {
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

      const res = await fetch("http://47.107.69.132:9400/API/Customer/Read", {
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
      setCustomers(data?.result?.data || []);
      
      if (data?.result?.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.result.pagination.totalPages || 1,
          totalRecords: data.result.pagination.totalRecords || 0,
        }));
      }
    } catch (err) {
      setCustomers([]);
      console.error("Error fetching customers:", err.message);
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
          color: #495057;
          background-color: #f8f9fa;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        .input-group {
          width: auto;
        }
      `}</style>

      {/* CUSTOMER TABLE */}
      {token && (
        <div className="card shadow">
          <div className="card-header bg-secondary text-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h5 className="mb-0">Customer List</h5>
              <div className="d-flex flex-wrap gap-2">
                <form onSubmit={handleSearch} className="d-flex">
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      <option value="customerId">Customer ID</option>
                      <option value="customerName">Customer Name</option>
                      <option value="phone">Phone</option>
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
                  <option value="customerId:asc">Sort by ID (A-Z)</option>
                  <option value="customerId:desc">Sort by ID (Z-A)</option>
                  <option value="customerName:asc">Sort by Name (A-Z)</option>
                  <option value="customerName:desc">Sort by Name (Z-A)</option>
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
                      <th onClick={() => handleSort("customerName")} className="cursor-pointer">
                        Name {sortField === "customerName" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Certificate Name</th>
                      <th>Certificate No</th>
                      <th onClick={() => handleSort("createDate")} className="cursor-pointer">
                        Created {sortField === "createDate" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer, index) => (
                        <tr key={index}>
                          <td>{customer.customerId}</td>
                          <td>{customer.customerName}</td>
                          <td>{customer.phone}</td>
                          <td>{customer.address}</td>
                          <td>{customer.certifiName}</td>
                          <td>{customer.certifiNo}</td>
                          <td>{customer.createDate ? new Date(customer.createDate).toLocaleString() : ''}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No customers found
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
                    {pagination.totalRecords} customers
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