"use client";

import { useEffect, useState } from "react";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import UserList from "@/MainComponent/UserList";
import PropertyTables from "@/MainComponent/(SubComponents)/AdminComponent/ViewProperty";
import PropertyUnitTables from "@/MainComponent/(SubComponents)/AdminComponent/ViewPropertyUinit";
import AdminSupportDashboard from "../admin_support_dashboard/page";
import Image from 'next/image';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function AdminDashboard() {
  const [activeContent, setActiveContent] = useState("Dashboard");

  const donutData = [
    { label: "Available", value: 45, color: "bg-success" },
    { label: "Sold", value: 38, color: "bg-primary" },
    { label: "Lost", value: 17, color: "bg-danger" },
  ];

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Performance",
        data: [65, 59, 80, 81, 56, 70],
        fill: false,
        borderColor: "#0d6efd",
        tension: 0.3,
      },
    ],
  };

  // Sidebar menu structure
  const sidebarMenu = [
    {
      title: "Reports",
      children: [
        { name: "Sales", key: "sales" },
        { name: "All Enrollment", key: "All Enrollment" },
        { name: "admin_support_dashboard", key: "admin_support_dashboard" },
      ],
    },
    {
      title: "View Property",
      children: [
        { name: "Property", key: "Property" },
        { name: "Property Unit", key: "Property Unit" },
        
      ],
    },

    {
      title: "View Calin Info",
      children: [
        { name: "Meter", key: "calinMeter" },
        { name: "Customer", key: "calinCustomer" },
        { name: "Tariff", key: "calinTariff" },
        { name: "Account", key: "calinAccount" },
        { name: "Vend", key: "calinVend" },
      ],
    },
  ];

  // Dummy content
  const renderContent = () => {
    switch (activeContent) {
      case "sales":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Sales Report</h5>
              <p>Dummy content showing sales data...</p>
            </div>
          </div>
        );
      case "All Enrollment":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">All Enrollment Report</h5>
              <UserList />
            </div>
          </div>
        );
      case "admin_support_dashboard":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Admin Support Dashboard</h5>
              <AdminSupportDashboard />
            </div>
          </div>
        );

      case "Property":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Property Information</h5>
              <PropertyTables />
            </div>
          </div>
        );
      case "Property Unit":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Unit Information</h5>
              <PropertyUnitTables />
            </div>
          </div>
        );

      case "calinMeter":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Calin Meter Info</h5>
              <p>Dummy details for Calin meter...</p>
            </div>
          </div>
        );
      case "calinCustomer":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Calin Customer Info</h5>
              <p>Dummy details for Calin customer...</p>
            </div>
          </div>
        );
      case "calinTariff":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Calin Tariff Info</h5>
              <p>Dummy details for Calin tariff...</p>
            </div>
          </div>
        );
      case "calinAccount":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Calin Account Info</h5>
              <p>Dummy details for Calin Account...</p>
            </div>
          </div>
        );
      case "calinVend":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Calin Vend Info</h5>
              <p>Dummy details for Calin Vend...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="customer-support d-flex flex-column min-vh-100">
      {/* Navbar (Sticky) */}
      <nav className="navbar navbar-light bg-white sticky-top px-3">
        <button
          className="btn shadow-none border-0 d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-controls="mobileSidebar"
        >
          <i className="bi bi-list"></i>
        </button>
        <a
          href="/"
          className="d-flex align-items-center text-decoration-none text-dark"
        >
          <img
            src="/assets/logo.png"
            className="logo rounded-2 d-none d-md-block"
            alt="Noretek Energy Ltd"
            width={120}
          />
        </a>
        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-search"></i>
          <i className="bi bi-bell"></i>
          <img
            src="/assets/person.png"
            className="profile rounded-5"
            alt="User"
            width={35}
          />
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Sidebar - Desktop */}
        <aside
          className="bg-white border-end p-3 d-none d-lg-block"
          style={{ width: "250px" }}
        >
          <div className="accordion" id="sidebarMenu">
            <ul className="navbar-nav">
              <li className="nav-item mx-3">
                <a
                  href="/dashboard"
                  className="nav-link btn-link fw-bold shadow-sm"
                >
                  Admin Dashboard
                </a>
              </li>
            </ul>
            {sidebarMenu.map((section, idx) => (
              <div className="accordion-item border-0" key={idx}>
                <h2 className="accordion-header" id={`heading${idx}`}>
                  <button
                    className="accordion-button collapsed fw-semibold shadow-none border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${idx}`}
                  >
                    {section.title}
                  </button>
                </h2>
                {section.children.length > 0 && (
                  <div
                    id={`collapse${idx}`}
                    className="accordion-collapse collapse"
                  >
                    <div className="accordion-body p-2">
                      <ul className="list-unstyled mb-0">
                        {section.children.map((child, i) => (
                          <li key={i} className="p-1">
                            <button
                              onClick={() => setActiveContent(child.key)}
                              className="btn btn-link text-decoration-none p-0"
                            >
                              {child.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Sidebar - Mobile (Offcanvas) */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="mobileSidebar"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Menu</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <div className="accordion border-0" id="mobileSidebarMenu">
              {sidebarMenu.map((section, idx) => (
                <div className="accordion-item border-0" key={idx}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed fw-semibold shadow-none border-0"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#mobileCollapse${idx}`}
                    >
                      {section.title}
                    </button>
                  </h2>
                  {section.children.length > 0 && (
                    <div
                      id={`mobileCollapse${idx}`}
                      className="accordion-collapse collapse"
                    >
                      <div className="accordion-body p-2">
                        <ul className="list-unstyled mb-0">
                          {section.children.map((child, i) => (
                            <li key={i} className="p-1">
                              <button
                                onClick={() => {
                                  setActiveContent(child.key);
                                  document
                                    .getElementById("mobileSidebar")
                                    .classList.remove("show"); // close sidebar
                                }}
                                className="btn btn-link text-decoration-none p-0"
                              >
                                {child.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow-1 p-4 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">{activeContent}</h4>
            <span className="text-muted">
              August 12<sup>th</sup> Tuesday, 2025
            </span>
          </div>

          {/* Default Dashboard stats */}
          {activeContent === "Dashboard" && (
            <>
              {/* Stats Row */}
              <div className="row mb-4">
                {/* Donut Chart */}
                <div className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100 text-center">
                    <div className="card-body">
                      <svg width="100%" height="180" viewBox="0 0 42 42">
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="#198754"
                          strokeWidth="5"
                          strokeDasharray={`${donutData[0].value} ${
                            100 - donutData[0].value
                          }`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="#0d6efd"
                          strokeWidth="5"
                          strokeDasharray={`${donutData[1].value} ${
                            100 - donutData[1].value
                          }`}
                          strokeDashoffset={`-${donutData[0].value}`}
                        />
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="#dc3545"
                          strokeWidth="5"
                          strokeDasharray={`${donutData[2].value} ${
                            100 - donutData[2].value
                          }`}
                          strokeDashoffset={`-${
                            donutData[0].value + donutData[1].value
                          }`}
                        />
                      </svg>
                      <div className="mt-3">
                        {donutData.map((d, i) => (
                          <div key={i}>
                            <span className={`badge ${d.color} me-1`}>
                              &nbsp;
                            </span>
                            {d.label} {d.value}%
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Customers */}
                <div className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100 text-center">
                    <div className="card-body">
                      <h2 className="fw-bold">34</h2>
                      <p className="text-muted mb-0">
                        Customers that were <a href="#">serviced</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Awaiting */}
                <div className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100 text-center">
                    <div className="card-body">
                      <h2 className="fw-bold">63</h2>
                      <p className="text-muted mb-0">
                        They are awaiting for <a href="#">respond</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Render Dynamic Content */}
          {renderContent()}

          {/* Search + Filter + Chart */}
          <div className="mt-4">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <input
                type="text"
                className="form-control w-auto flex-grow-1"
                placeholder="Search..."
              />
              <select className="form-select w-auto">
                <option>Filter by</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="card p-3">
              <Line data={lineData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
