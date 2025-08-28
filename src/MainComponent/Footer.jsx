"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-top shadow py-3 text-sm bg-light">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Left: Logo */}
        <div>
          <img
            src="/assets/logo.png"
            alt="Noretek Logo"
            className="rounded-2"
            style={{ height: "40px" }}
          />
        </div>

        {/* Right: Policies */}
        <div>
          <small >
            &copy; Copyright {new Date().getFullYear()} &nbsp;&nbsp;
            <Link href="/privacy-policy" className="text-decoration-none me-3 text-muted">
              Privacy Policy
            </Link>
            <Link
              href="/data-deletion-policy"
              className="text-decoration-none me-3 text-muted"
            >
              Data Deletion Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-decoration-none text-muted">
              Terms and Conditions
            </Link>
          </small>
        </div>
        <div className="">
          <a href="" className=" rounded-5 bg-body-secondary p-3 ">
            <i className="text-muted bi bi-arrow-up"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
