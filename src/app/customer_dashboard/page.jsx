"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [payments, setPayments] = useState([]);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [processingToken, setProcessingToken] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    meterNumber: ""
  });

  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch user data from localStorage or API
  useEffect(() => {
    const fetchUserData = () => {
      setIsLoading(true);
      try {
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) setEmail(storedEmail);
        
        // Try to get user data from localStorage (simulating API fetch)
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          
          // If user data doesn't have email, set it from localStorage
          if (!parsedData.email && storedEmail) {
            setUserData(prev => ({...prev, email: storedEmail}));
          }
        } else if (storedEmail) {
          // Initialize user data with email if no existing data
          setUserData(prev => ({...prev, email: storedEmail}));
        }
        
        // Try to get notification settings
        const storedNotifications = localStorage.getItem("notificationSettings");
        if (storedNotifications) {
          setNotificationSettings(JSON.parse(storedNotifications));
        }

        // Fetch payment history if user is logged in
        if (storedEmail) {
          refreshPayments(storedEmail);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const refreshPayments = async (email) => {
    try {
      const response = await fetch(`/api/payments/history?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userToken");
    router.push("/customer-signin");
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveStatus("saving");
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ensure email is included in user data
      const updatedUserData = {...userData, email: email};
      
      // Save to localStorage (simulating API save)
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveStatus("password_mismatch");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setSaveStatus("password_changed");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };

  const saveNotificationSettings = async () => {
    setIsLoading(true);
    setSaveStatus("saving");
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save to localStorage (simulating API save)
      localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
      
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { amount, meterNumber } = paymentForm;
      
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          amount: parseInt(amount),
          meterNumber: meterNumber,
          metadata: {
            meter_number: meterNumber
          }
        })
      });

      const data = await response.json();

      if (data.status) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorization_url;
      } else {
        setSaveStatus("payment_error: " + (data.message || 'Failed to initialize payment'));
      }
    } catch (error) {
      setSaveStatus("payment_error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewToken = async (payment) => {
    if (payment.status !== 'success') {
      setSaveStatus('Token is only available for successful payments. Current status: ' + payment.status);
      return;
    }

    setSelectedPayment(payment);
    setProcessingToken(true);
    
    try {
      // Generate token on demand
      const tokenResponse = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: payment.reference,
          amount: payment.amount,
          meterNumber: payment.metadata?.meter_number || payment.meter_number
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenResponse.ok && tokenData.success) {
        setGeneratedToken({
          token: tokenData.token,
          meterNumber: tokenData.meterNumber,
          units: tokenData.units,
          reference: payment.reference
        });
        setShowTokenModal(true);
        
        // Refresh payments to update with token
        await refreshPayments(email);
      } else {
        setSaveStatus('Failed to generate token: ' + (tokenData.message || 'Unknown error'));
      }
    } catch (error) {
      setSaveStatus('Error generating token: ' + error.message);
    } finally {
      setProcessingToken(false);
    }
  };

  const handlePrintToken = () => {
    const printContent = `
      <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Electricity Token Receipt</h2>
        <div style="border: 2px solid #000; padding: 15px; margin: 20px 0;">
          <h3>TOKEN: <span style="font-size: 24px; letter-spacing: 2px;">${generatedToken.token}</span></h3>
        </div>
        <p><strong>Meter Number:</strong> ${generatedToken.meterNumber}</p>
        <p><strong>Units:</strong> ${generatedToken.units} kWh</p>
        <p><strong>Amount:</strong> ₦${selectedPayment.amount}</p>
        <p><strong>Reference:</strong> ${generatedToken.reference}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <hr>
        <p>Thank you for your purchase!</p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Token - ${generatedToken.reference}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 9999}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Status Alert */}
      {saveStatus && (
        <div className={`alert alert-${saveStatus.includes('error') ? 'danger' : 'success'} alert-dismissible fade show position-fixed top-0 end-0 m-3`} style={{zIndex: 9998}} role="alert">
          {saveStatus === "saving" && "Saving changes..."}
          {saveStatus === "saved" && "Changes saved successfully!"}
          {saveStatus === "password_changed" && "Password changed successfully!"}
          {saveStatus === "password_mismatch" && "New passwords don't match!"}
          {saveStatus.includes("payment_error") && saveStatus.replace("payment_error: ", "")}
          {saveStatus.includes("Token is only available") && saveStatus}
          {saveStatus.includes("Failed to generate token") && saveStatus}
          {saveStatus.includes("Error generating token") && saveStatus}
          {saveStatus === "error" && "An error occurred. Please try again."}
          <button type="button" className="btn-close" onClick={() => setSaveStatus("")}></button>
        </div>
      )}

      {/* Token Modal */}
      {showTokenModal && generatedToken && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Electricity Token</h5>
                <button type="button" className="btn-close" onClick={() => setShowTokenModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <div className="bg-dark text-light p-3 rounded mb-3">
                  <h2 className="display-5 font-monospace">{generatedToken.token}</h2>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Meter Number:</strong><br/>{generatedToken.meterNumber}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Units:</strong><br/>{generatedToken.units} kWh</p>
                  </div>
                </div>
                <p><strong>Reference:</strong><br/>{generatedToken.reference}</p>
                <p><strong>Amount Paid:</strong><br/>₦{selectedPayment.amount}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => {
                  navigator.clipboard.writeText(generatedToken.token);
                  alert('Token copied to clipboard!');
                }}>
                  <i className="bi bi-clipboard me-1"></i> Copy Token
                </button>
                <button className="btn btn-primary" onClick={handlePrintToken}>
                  <i className="bi bi-printer me-1"></i> Print Token
                </button>
                <button className="btn btn-success" onClick={() => setShowTokenModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processingToken && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Generating token...</span>
          </div>
          <span className="ms-2 text-white">Generating token...</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap px-2">
          <button
            className="btn text-white me-3 d-lg-none"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list"></i>
          </button>

          <a className="navbar-brand text-white me-auto" href="#">
            Dashboard
          </a>

          <ul className="navbar-nav d-flex flex-row ms-auto">
            <li className="nav-item mx-2">
              <a className="nav-link text-white text-truncate" href="">
                <i className="bi bi-person me-2"></i>
                {email}
              </a>
            </li>
            <li className="nav-item mx-2">
              <button className="btn btn-outline-light" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="d-flex">
        {/* Sidebar */}
        <div
          className={`sidebar bg-primary text-white p-2 ${
            sidebarOpen ? "d-block" : "d-none"
          } d-lg-block`}
          style={{ minHeight: "100vh", width: "250px" }}
        >
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <a 
                className={`nav-link text-white ${activeSection === "dashboard" ? "active bg-light text-dark rounded" : ""}`}
                href="#"
                onClick={() => setActiveSection("dashboard")}
              >
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </a>
            </li>
            <li className="nav-item mb-2">
              <a 
                className={`nav-link text-white ${activeSection === "transactions" ? "active bg-light text-dark rounded" : ""}`}
                href="#"
                onClick={() => setActiveSection("transactions")}
              >
                <i className="bi bi-cash me-2"></i>Transaction History
              </a>
            </li>
            <li className="nav-item mb-2">
              <a 
                className={`nav-link text-white ${activeSection === "wallet" ? "active bg-light text-dark rounded" : ""}`}
                href="#"
                onClick={() => setActiveSection("wallet")}
              >
                <i className="bi bi-wallet2 me-2"></i>Wallet Balance
              </a>
            </li>
            <li className="nav-item mb-2">
              <a 
                className={`nav-link text-white ${activeSection === "buy" ? "active bg-light text-dark rounded" : ""}`}
                href="#"
                onClick={() => setActiveSection("buy")}
              >
                <i className="bi bi-credit-card me-2"></i>Buy Token
              </a>
            </li>
            <li className="nav-item mb-2">
              <a 
                className={`nav-link text-white ${activeSection === "support" ? "active bg-light text-dark rounded" : ""}`}
                href="#"
                onClick={() => setActiveSection("support")}
              >
                <i className="bi bi-phone me-2"></i>Contact Support
              </a>
            </li>
            <li className="nav-item mt-3">
              <a 
                className={`nav-link text-white ${activeSection === "settings" ? "active bg-light text-dark rounded" : ""}`}
                href="#"
                onClick={() => setActiveSection("settings")}
              >
                <i className="bi bi-gear me-2"></i>Settings
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div id="main" className="flex-grow-1 p-4 bg-light">
          {activeSection === "dashboard" && (
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="mb-3">🎉 Welcome to Your Dashboard</h2>
                <p className="lead">This is your secure user area.</p>
                <p className="text-muted">
                  You can manage your wallet, tokens and settings from the sections below.
                </p>
              </div>

              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <i className="bi bi-wallet2 fs-1 text-primary me-3"></i>
                      <div>
                        <h5 className="card-title mb-1">Wallet Balance</h5>
                        <p className="card-text text-muted">$0.00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <i className="bi bi-credit-card fs-1 text-primary me-3"></i>
                      <div>
                        <h5 className="card-title mb-1">Buy Token (Vend)</h5>
                        <p className="card-text text-muted">
                          Click here to buy token
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <i className="bi bi-clock-history fs-1 text-primary me-3"></i>
                      <div>
                        <h5 className="card-title mb-1">Recent Transactions</h5>
                        <p className="card-text text-muted">
                          View your transaction history
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <i className="bi bi-gear fs-1 text-primary me-3"></i>
                      <div>
                        <h5 className="card-title mb-1">Settings</h5>
                        <p className="card-text text-muted">
                          Manage your account settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="container">
              <h2 className="mb-4">Account Settings</h2>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="card shadow-sm mb-4">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Profile Information</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleProfileUpdate}>
                        <div className="mb-3">
                          <label htmlFor="firstName" className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            value={userData.firstName}
                            onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="lastName" className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            value={userData.lastName}
                            onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email Address</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            disabled
                            style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}
                          />
                          <div className="form-text">This is the email you used to login. It cannot be changed.</div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            value={userData.phone}
                            onChange={(e) => setUserData({...userData, phone: e.target.value})}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="address" className="form-label">Address</label>
                          <textarea
                            className="form-control"
                            id="address"
                            rows="3"
                            value={userData.address}
                            onChange={(e) => setUserData({...userData, address: e.target.value})}
                          ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">
                          Update Profile
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card shadow-sm mb-4">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Change Password</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handlePasswordChange}>
                        <div className="mb-3">
                          <label htmlFor="currentPassword" className="form-label">Current Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="newPassword" className="form-label">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          Change Password
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Notification Preferences</h5>
                    </div>
                    <div className="card-body">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                        />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Email Notifications
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="smsNotifications"
                          name="smsNotifications"
                          checked={notificationSettings.smsNotifications}
                          onChange={handleNotificationChange}
                        />
                        <label className="form-check-label" htmlFor="smsNotifications">
                          SMS Notifications
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="promotionalEmails"
                          name="promotionalEmails"
                          checked={notificationSettings.promotionalEmails}
                          onChange={handleNotificationChange}
                        />
                        <label className="form-check-label" htmlFor="promotionalEmails">
                          Promotional Emails
                        </label>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={saveNotificationSettings}
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "transactions" && (
            <div className="container">
              <h2 className="mb-4">Transaction History</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  {payments.length === 0 ? (
                    <p className="text-center text-muted">No transactions yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead className="table-primary">
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Reference</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment._id || payment.id}>
                              <td>{new Date(payment.createdAt || payment.created_at).toLocaleDateString()}</td>
                              <td>₦{payment.amount}</td>
                              <td>
                                <span className={`badge ${
                                  payment.status === 'success' ? 'bg-success' : 
                                  payment.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="small">{payment.reference}</td>
                              <td>
                                <button 
                                  className={`btn btn-sm ${payment.status === 'success' ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                                  onClick={() => handleViewToken(payment)}
                                  disabled={payment.status !== 'success' || processingToken}
                                  title={payment.status !== 'success' ? 'Token available only for successful payments' : 'View Token'}
                                >
                                  {processingToken && selectedPayment?.reference === payment.reference ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                      Generating...
                                    </>
                                  ) : (
                                    'View Token'
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "wallet" && (
            <div className="container">
              <h2 className="mb-4">Wallet Balance</h2>
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <h1 className="display-4">$0.00</h1>
                  <p className="text-muted">Current Balance</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "buy" && (
            <div className="container">
              <h2 className="mb-4">Buy Tokens</h2>
              <div className="row">
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Make Payment</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleMakePayment}>
                        <div className="mb-3">
                          <label htmlFor="meterNumber" className="form-label">Meter Number *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="meterNumber"
                            value={paymentForm.meterNumber}
                            onChange={(e) => setPaymentForm({...paymentForm, meterNumber: e.target.value})}
                            required
                            placeholder="Enter your meter number"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="amount" className="form-label">Amount (₦) *</label>
                          <input
                            type="number"
                            className="form-control"
                            id="amount"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                            min="100"
                            step="100"
                            required
                            placeholder="Enter amount in Naira"
                          />
                          <div className="form-text">Minimum amount: ₦100</div>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                        >
                          Proceed to Payment
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-clock-history me-2"></i>
                        Recent Payments
                      </h5>
                    </div>
                    <div className="card-body">
                      {payments.length === 0 ? (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          No payments yet. Make your first payment!
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-striped table-sm">
                            <thead className="table-primary">
                              <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Reference</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments.slice(0, 5).map((payment) => (
                                <tr key={payment._id || payment.id}>
                                  <td>{new Date(payment.createdAt || payment.created_at).toLocaleDateString()}</td>
                                  <td>₦{payment.amount}</td>
                                  <td>
                                    <span className={`badge ${
                                      payment.status === 'success' ? 'bg-success' : 
                                      payment.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                    }`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                  <td className="small">{payment.reference}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "support" && (
            <div className="container">
              <h2 className="mb-4">Contact Support</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="subject" className="form-label">Subject</label>
                      <input type="text" className="form-control" id="subject" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea className="form-control" id="message" rows="5"></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Send Message</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}