'use client';
import Link from "next/link";

export default function QuickLinks() {
  const fScience = [
    {
      id: 1,
      name: "Admin Dashboard",
      routes: "/admin_dashboard",
    },
    {
      id: 2,
      name: "Customer Dashboard",
      routes: "/customer_dashboard",
    },
    {
      id: 3,
      name: "Services",
      routes: "/services",
    },
    {
      id: 4,
      name: "Create Account",
      routes: "/create-account",
    },
    {
      id: 5,
      name: "Customer Support",
      routes: "/customer-support",
    },
    {
      id: 6,
      name: "Customer Support Landing",
      routes: "/customer-support-landing",
    },
    {
      id: 7,
      name: "Calinav Component",
      routes: "/calinav", // If you still want to render Calinav directly
    },
    {
      id: 8,
      name: "Customer Page",
      routes: "/customer", // This is the actual customer page
    },
  ];

  return (
    <section id="placement" className="cardList min-vh-100 section-bg pb-4">
      <div className="container" data-aos="fade-up">
        <div className="section-title">
          <h2 className="text-center fw-bold text-uppercase">
            Here are Quick Links.
          </h2>
          <p className="text-center">
            You can use these links to explore hidden routes for now.
          </p>
        </div>

        <div className="row g-4 align-items-center text-center">
          {fScience.map((fs) => (
            <div
              key={fs.id}
              className="col-lg-6 col-12"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div className="card stateBody border-0">
                <Link className="p-3 text-decoration-none" href={fs.routes}>
                  {fs.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
