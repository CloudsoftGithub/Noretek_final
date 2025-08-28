import Link from "next/link";

export default function HomeNavbar() {
  return (
    <nav className="navbar navbar-expand-md shadow-sm py-1 justify-content-center align-content-around">
      <div className="container">
        <img src="/assets/logo.png" className="  rounded-2 " alt="" />

        <button
          className="navbar-toggler shadow-none border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-nav"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end align-center mx-2"
          id="main-nav"
        >
          <ul className="navbar-nav justify-content-center align-items-center">
            <li className="nav-item mx-lg-1">
              <a href="/" className="nav-link fw-bold shadow-sm">
                Home
              </a>
            </li>

            <li className="nav-item mx-lg-2">
              <a
                href="/sign-in"
                className="nav-link btn-link fw-bold btnStyle shadow-sm "
              >
                Register Now
              </a>
            </li>
            <li className="nav-item mx-lg-2">
              <a
                href="/customer-signin"
                className="nav-link btn-link fw-bold shadow-sm"
              >
                Login
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
