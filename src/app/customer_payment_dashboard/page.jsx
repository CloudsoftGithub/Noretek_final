'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CustomerPaymentDashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [processingToken, setProcessingToken] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get email from localStorage (user is already logged in)
        const storedEmail = localStorage.getItem('userEmail');
        
        if (!storedEmail) {
          setError('User not authenticated. Please login again.');
          setLoading(false);
          return;
        }

        setUser({ email: storedEmail });

        // Fetch payments
        await refreshPayments(storedEmail);
          
        // Check if redirected from payment with reference
        const reference = searchParams?.get('reference') || searchParams?.get('trxref');
        const paymentSuccess = searchParams?.get('payment_success');
        
        if (reference && paymentSuccess) {
          console.log('🔄 Payment callback detected, verifying payment:', reference);
          verifyPayment(reference, storedEmail);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const refreshPayments = async (email) => {
      try {
        const response = await fetch(`/api/payments/history?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setPayments(data.payments || []);
        } else {
          console.error('Failed to fetch payments');
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    const verifyPayment = async (reference, userEmail) => {
      try {
        console.log('🔍 Verifying payment with reference:', reference);
        
        const response = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await response.json();
        
        console.log('📦 Verification API response:', data);
        
        if (data.status && data.data.status === 'success') {
          console.log('💰 Payment successful');
          
          // Refresh payments to show updated status
          await refreshPayments(userEmail);
        }
      } catch (error) {
        console.error('💥 Payment verification error:', error);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleViewToken = async (payment) => {
    if (payment.status !== 'success') {
      setError('Token is only available for successful payments. Current status: ' + payment.status);
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
        await refreshPayments(user.email);
      } else {
        setError('Failed to generate token: ' + (tokenData.message || 'Unknown error'));
      }
    } catch (error) {
      setError('Error generating token: ' + error.message);
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

  const handleMakePayment = async (formData) => {
    try {
      const { amount, meterNumber } = formData;
      
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
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
        throw new Error(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading payment dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Token Modal */}
      {showTokenModal && generatedToken && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
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

      <div className="row mb-4">
        <div className="col">
          <h2 className="h4">Electricity Token Purchase</h2>
          <p className="text-muted">Welcome, {user?.email}</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Make Payment</h5>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleMakePayment({
                  amount: formData.get('amount'),
                  meterNumber: formData.get('meterNumber')
                });
              }}>
                <div className="mb-3">
                  <label htmlFor="meterNumber" className="form-label">Meter Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="meterNumber"
                    required
                    placeholder="Enter your meter number"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">Amount (₦) *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
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
                Payment History
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
      </div>
    </div>
  );
}