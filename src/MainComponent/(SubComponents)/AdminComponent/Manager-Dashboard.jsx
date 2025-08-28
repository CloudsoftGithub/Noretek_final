"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const sidebarItems = [
  { icon: "🏠", label: "Dashboard", active: true },
  { icon: "🎫", label: "Meter" },
  { icon: "⚡", label: "Customer" },
  { icon: "🏘️", label: "Tarrif" },
  { icon: "🔔", label: "Account" },
  
];

const statsCards = [
  { title: "Total Properties", value: "10", icon: "🏢" },
  { title: "Total Support", value: "5", icon: "🛠️" },
  { title: "Total Enrollment Office", value: "10", icon: "👥" },
  { title: "Total Tenancy", value: "200", icon: "👤" },
  { title: "Total Income Generate", value: "₦ 543,444,20", icon: "💰" },
];

const teamMembers = [
  { name: "John Doe", role: "Support", avatar: "/placeholder.svg" },
  { name: "Jane Smith", role: "Support", avatar: "/placeholder.svg" },
  { name: "Laura Garcia", role: "Support", avatar: "/placeholder.svg" },
  { name: "Jamila Salim", role: "Enrollment Officer", avatar: "/placeholder.svg" },
  { name: "Michael Brown", role: "Support", avatar: "/placeholder.svg" },
  { name: "David Wilson", role: "Enrollment Officer", avatar: "/placeholder.svg" },
  { name: "Sarah Davis", role: "Support", avatar: "/placeholder.svg" },
  { name: "Emily Johnson", role: "Admin", avatar: "/placeholder.svg" },
  { name: "Henry Arthur", role: "Admin", avatar: "/placeholder.svg" },
  { name: "Claire Johnson", role: "Admin", avatar: "/placeholder.svg" },
];

export default function ManagerDashboard() {
  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
        {/* Offcanvas toggle button (mobile only) */}
        <button
          className="btn btn-outline-primary d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-controls="mobileSidebar"
        >
          ☰
        </button>

        {/* Logo */}
        <Link href="/" className="d-flex align-items-center text-decoration-none">
          <div
            className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2"
            style={{ width: "40px", height: "40px" }}
          >
            N
          </div>
          <Image src="/assets/logo.png" alt="Noretek Energy Ltd" width={180} height={60} priority />
        </Link>
      </header>

      <div className="d-flex">
        {/* Sidebar for desktop */}
        <div className="custom-sidebar d-none d-lg-block p-3 bg-white border-end min-vh-100">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`d-flex align-items-center p-2 rounded mb-2 ${
                item.active ? "bg-primary text-white" : "text-dark"
              }`}
              role="button"
            >
              <span className="me-2 fs-5">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Offcanvas for mobile */}
        <div
          className="offcanvas offcanvas-start d-lg-none"
          tabIndex={-1}
          id="mobileSidebar"
          aria-labelledby="mobileSidebarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileSidebarLabel">Menu</h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            {sidebarItems.map((item, index) => (
              <div
                key={index}
                className={`d-flex align-items-center p-2 rounded mb-2 ${
                  item.active ? "bg-primary text-white" : "text-dark"
                }`}
                role="button"
              >
                <span className="me-2 fs-5">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-grow-1 p-4">
          <h2 className="mb-4">Meter</h2>

          {/* Stats */}
          <div className="row mb-4">
            {statsCards.map((stat, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{stat.title}</small>
                      <span className="text-muted">&#8599;</span>
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <span className="fs-5 me-2">{stat.icon}</span>
                      <h5 className="mb-0 fw-bold">{stat.value}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h2 className="mb-4">Customer</h2>

          {/* Stats */}
          <div className="row mb-4">
            {statsCards.map((stat, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{stat.title}</small>
                      <span className="text-muted">&#8599;</span>
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <span className="fs-5 me-2">{stat.icon}</span>
                      <h5 className="mb-0 fw-bold">{stat.value}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
 <h2 className="mb-4">Tarrif</h2>

          {/* Stats */}
          <div className="row mb-4">
            {statsCards.map((stat, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{stat.title}</small>
                      <span className="text-muted">&#8599;</span>
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <span className="fs-5 me-2">{stat.icon}</span>
                      <h5 className="mb-0 fw-bold">{stat.value}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
           <h2 className="mb-4">Account</h2>

          {/* Stats */}
          <div className="row mb-4">
            {statsCards.map((stat, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{stat.title}</small>
                      <span className="text-muted">&#8599;</span>
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <span className="fs-5 me-2">{stat.icon}</span>
                      <h5 className="mb-0 fw-bold">{stat.value}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* LPG Donut Chart */}
          <div className="card mb-4">
            <div className="card-header">LPG Gas</div>
            <div className="card-body text-center">
              <div
                className="rounded-circle bg-gradient p-3 mx-auto mb-3"
                style={{
                  width: "130px",
                  height: "130px",
                  background: "conic-gradient(red 0 25%, green 25% 100%)",
                }}
              >
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center h-100">
                  <strong>10000 Kg</strong>
                </div>
              </div>
              <div className="d-flex justify-content-center gap-4">
                <small>
                  <span className="badge bg-danger me-1">&nbsp;</span>Requesting 7200 kg
                </small>
                <small>
                  <span className="badge bg-success me-1">&nbsp;</span>Available 10000 kg
                </small>
              </div>
            </div>
          </div>

          {/* Team Members 
          <div className="card">
            <div className="card-header">Team Members</div>
            <div className="card-body">
              <div className="row">
                {teamMembers.map((member, index) => (
                  <div key={index} className="col-md-6 d-flex align-items-center mb-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                    />
                    <div>
                      <div className="fw-medium">{member.name}</div>
                      <small className="text-muted">{member.role}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          */}
        </main>
      </div>
    </div>
  );
}
