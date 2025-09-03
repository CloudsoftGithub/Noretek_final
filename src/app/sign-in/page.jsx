"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HomeNavbar from "@/MainComponent/HomeNavbar";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/customer-signin-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication token if provided
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
          }
        }
        
        // Redirect based on user role or to dashboard
        router.push(data.redirectTo || "/customer-dashboard");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HomeNavbar />
      <div className="min-vh-100 bg-light">
        <form onSubmit={handleSubmit}>
          <div className="d-flex align-items-center justify-content-center min-vh-100 p-4">
            <div className="w-100" style={{ maxWidth: "500px" }}>
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark">Sign in with</h2>
              </div>

              {/* Social login buttons */}
              <div className="d-grid gap-3">
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2"
                >
                  <span>Google an account</span>
                  <div
                    className="rounded-circle"
                    style={{
                      width: "24px",
                      height: "24px",
                      background:
                        "linear-gradient(to right, #3b82f6, #ef4444, #facc15)",
                    }}
                  ></div>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2"
                >
                  <span>Apple an account</span>
                  <div
                    className="rounded-circle bg-dark d-flex align-items-center justify-content-center"
                    style={{ width: "24px", height: "24px" }}
                  >
                    <span className="text-white small">🍎</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2"
                >
                  <span>Microsoft an account</span>
                  <div
                    className="rounded-circle"
                    style={{
                      width: "24px",
                      height: "24px",
                      background:
                        "linear-gradient(to bottom right, #ef4444, #22c55e, #3b82f6)",
                    }}
                  ></div>
                </button>
              </div>

              {/* Divider */}
              <div className="position-relative my-4">
                <hr />
                <div className="position-absolute top-50 start-50 translate-middle bg-light px-3 text-muted small">
                  or
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Email and Password Inputs */}
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="form-control form-control-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="form-control form-control-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <label
                    className="form-check-label text-muted small"
                    htmlFor="remember"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgotepassword"
                  className="text-primary small text-decoration-none"
                >
                  Forgot my login details?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-100 btn-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  "Continue"
                )}
              </button>

              {/* Bottom Message */}
              <div className="text-center mt-4">
                <small className="text-muted">
                  Don't have an account?{" "}
                  <Link
                    href="/customer-signup"
                    className="text-primary text-decoration-none"
                  >
                    Sign up
                  </Link>
                </small>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}