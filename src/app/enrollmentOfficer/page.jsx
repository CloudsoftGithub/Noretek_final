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
import PropertyForm from "@/MainComponent/(SubComponents)/EnrollmentComponent/PropertyForm";
import PropertyUnitForm from "@/MainComponent/(SubComponents)/EnrollmentComponent/PropertyUnitForm";
import PropertyTablesEnrollment from "@/MainComponent/(SubComponents)/EnrollmentComponent/PropertyTablesEnrollment";
import PropertyUnitTablesEnrollment from "@/MainComponent/(SubComponents)/EnrollmentComponent/PropertyUnitTablesEnrollment";
import CustomerSignUp from "@/MainComponent/(SubComponents)/EnrollmentComponent/CreateCustomer";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [activeContent, setActiveContent] = useState("Dashboard");

  // Sidebar menu structure
  const sidebarMenu = [
    {
      title: "Adding Form",
      children: [
        { name: "Add Property", key: "Add Property" },
        { name: "Add Property Unit", key: "Add Property Unit" },
        { name: "Create Customer", key: "Create Customer" },
      ],
    },
  ];

  // Dummy content
  const renderContent = () => {
    switch (activeContent) {
      case "Add Property":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <PropertyForm />
            </div>
          </div>
        );
      case "Add Property Unit":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <PropertyUnitForm />
            </div>
          </div>
        );
      case "Create Customer":
        return (
          <div className="card mb-4">
            <div className="card-body">
              <CustomerSignUp />
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
                  href="/enrollmentOfficer"
                  className="nav-link btn-link fw-bold shadow-sm"
                >
                  EnrollmentOfficer
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
                {/* Customers */}
                <div className="col-lg-12 col-md-6 mb-3">
                  <div className="card h-100 text-center">
                    <div className="card-body">
                      <h5 className="card-title">Property Information</h5>
                      <PropertyTablesEnrollment />
                    </div>
                  </div>
                </div>

                {/* Awaiting */}
                <div className="col-lg-12 col-md-6 mb-3">
                  <div className="card h-100 text-center">
                    <div className="card-body">
                      <h5 className="card-title">Property Unit Information</h5>
                      <PropertyUnitTablesEnrollment />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Render Dynamic Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
