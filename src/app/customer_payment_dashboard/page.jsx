// src/app/customer_payment_dashboard/page.jsx
'use client';
import PaymentForm from '@/MainComponent/PaymentForm';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CustomerPaymentDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [viewingToken, setViewingToken] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Check if we're in browser environment first
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Get email from URL parameters or localStorage
        const urlEmail = searchParams?.get('email');
        const storedEmail = localStorage.getItem('userEmail');
        const userEmail = urlEmail || storedEmail;

        console.log('📧 User email for dashboard:', userEmail);

        if (!userEmail) {
          window.location.href = '/customer-signin';
          return;
        }

        setUser({ email: userEmail, id: localStorage.getItem('userId') });

        // Fetch payments
        const response = await fetch(`/api/payments/history?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (response.ok) {
          setPayments(data.payments || []);
          
          // Check if we need to verify a payment (redirect from Paystack)
          const reference = searchParams?.get('reference') || searchParams?.get('trxref');
          const paymentSuccess = searchParams?.get('payment_success');
          
          if (reference && !paymentSuccess) {
            console.log('🔄 Payment verification needed for reference:', reference);
            verifyPayment(reference, userEmail);
          } else if (paymentSuccess === 'true') {
            // Show success message if redirected from successful payment
            const token = localStorage.getItem('lastToken');
            const meter = localStorage.getItem('lastMeter');
            const units = localStorage.getItem('lastUnits');
            
            if (token && meter) {
              setGeneratedToken({
                token,
                meterNumber: meter,
                units: units || '0',
                reference: searchParams?.get('ref') || '',
                amount: localStorage.getItem('lastAmount') || '0'
              });
              setShowSuccessModal(true);
            }
          }
        } else {
          setError(data.message || 'Failed to load payments');
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  const verifyPayment = async (reference, userEmail) => {
  setVerifyingPayment(true);
  try {
    console.log('🔍 Verifying payment with reference:', reference);
    
    const response = await fetch(`/api/payments/verify?reference=${reference}`);
    const data = await response.json();
    
    console.log('📦 Verification API response:', data);
    
    if (data.status && data.data.status === 'success') {
      console.log('💰 Payment successful');
      
      // Get token information from the response
      const token = data.data.token;
      const meterNumber = data.data.meterNumber;
      const units = data.data.units;
      const amount = data.data.amount / 100;
      
      if (token) {
        // Save token details
        const tokenInfo = {
          token: token,
          meterNumber: meterNumber,
          units: units || '0',
          amount: amount,
          reference: reference,
          customerName: userEmail,
          timestamp: new Date().toISOString()
        };
        
        setGeneratedToken(tokenInfo);
        
        // Store in localStorage for persistence
        localStorage.setItem('lastToken', token);
        localStorage.setItem('lastMeter', meterNumber);
        localStorage.setItem('lastUnits', units || '0');
        localStorage.setItem('lastAmount', amount.toString());
        
        // Also save to purchasedTokens object for viewToken functionality
        const purchasedTokens = JSON.parse(localStorage.getItem('purchasedTokens') || '{}');
        purchasedTokens[reference] = tokenInfo;
        localStorage.setItem('purchasedTokens', JSON.stringify(purchasedTokens));
        
        console.log('💾 Token saved to localStorage with reference:', reference);
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Update URL to remove payment parameters
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('reference');
        newUrl.searchParams.delete('trxref');
        newUrl.searchParams.set('payment_success', 'true');
        window.history.replaceState({}, '', newUrl);
      } else {
        // Payment successful but token pending
        setGeneratedToken({
          token: 'PENDING-' + reference,
          meterNumber: data.data.metadata?.meterNumber || 'Unknown',
          units: '0',
          amount: amount,
          reference: reference,
          customerName: userEmail,
          status: 'pending'
        });
        setShowSuccessModal(true);
        setError('Payment successful! Token generation is in progress. Please check back later.');
      }
      
      // Refresh payments list
      await refreshPayments(userEmail);
      
    } else {
      setError(data.message || `Payment failed. Status: ${data.data?.status || 'unknown'}`);
    }
  } catch (error) {
    console.error('💥 Payment verification error:', error);
    setError('Payment verification failed. Please try again.');
  } finally {
    setVerifyingPayment(false);
  }
};
    const refreshPayments = async (email) => {
      try {
        const response = await fetch(`/api/payments/history?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setPayments(data.payments || []);
        }
      } catch (error) {
        console.error('Error refreshing payments:', error);
      }
    };

    fetchData();
  }, [searchParams]);

  const viewToken = async (payment) => {
    if (payment.status !== 'success') {
      setError('Token is only available for successful payments');
      return;
    }

    setLoading(true);
    setSelectedPayment(payment);
    
    try {
      // Check if we have the token in localStorage (from recent purchase)
      const purchasedTokens = JSON.parse(localStorage.getItem('purchasedTokens') || '{}');
      const tokenData = purchasedTokens[payment.reference];
      
      if (tokenData) {
        setGeneratedToken({
          token: tokenData.token,
          meterNumber: tokenData.meterNumber,
          units: tokenData.units || '0',
          amount: tokenData.amount || payment.amount,
          reference: payment.reference,
          customerName: user?.email
        });
        setViewingToken(true);
      } else {
        setError('Token not found. Tokens are only available for recently purchased transactions. Please make a new purchase.');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      setError('Failed to retrieve token. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    if (!generatedToken) return;
    
    const printContent = `
      <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2c5aa0; margin-bottom: 5px;">Noretek Energy</h2>
        <h3 style="margin-top: 0; color: #333;">ELECTRICITY TOKEN RECEIPT</h3>
        <hr style="border-color: #ccc;">
        
        <div style="text-align: left; margin: 15px 0;">
          <p><strong>Customer:</strong> ${generatedToken.customerName || user?.email}</p>
          <p><strong>Meter Number:</strong> ${generatedToken.meterNumber}</p>
          <p><strong>Reference:</strong> ${generatedToken.reference}</p>
        </div>
        
        <div style="background: #000; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #fff;">YOUR TOKEN</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
            ${formatToken(generatedToken.token)}
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin: 15px 0;">
          <div style="text-align: left;">
            <p><strong>Amount Paid:</strong><br>₦${generatedToken.amount}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Units:</strong><br>${generatedToken.units} kWh</p>
          </div>
        </div>
        
        <div style="margin: 20px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Date:</strong> ${new Date().toLocaleDateString()} | 
            <strong>Time:</strong> ${new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <hr style="border-color: #ccc;">
        <p style="color: #666; font-size: 12px;">
          Thank you for your purchase! For assistance, contact support@noretekenergy.com
        </p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Token Receipt - ${generatedToken.reference}</title>
          <style>
            @media print {
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
              Print Receipt
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Close Window
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatToken = (token) => {
    if (!token) return 'N/A';
    return token.replace(/(.{4})/g, '$1 ').trim();
  };

  if (loading || verifyingPayment) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">
          {verifyingPayment ? 'Processing your payment and generating token...' : 'Loading your dashboard...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Success Modal with Receipt */}
      {showSuccessModal && generatedToken && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-check-circle me-2"></i>
                  Payment Successful!
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowSuccessModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Receipt Content */}
                <div className="receipt p-4 border rounded">
                  <div className="text-center mb-4">
                    <h3 className="text-primary fw-bold">Noretek Energy</h3>
                    <h5 className="text-dark">ELECTRICITY TOKEN RECEIPT</h5>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Customer:</strong> {generatedToken.customerName || user?.email}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Meter Number:</strong> {generatedToken.meterNumber}</p>
                    </div>
                  </div>
                  
                  <div className="bg-dark text-light p-4 rounded text-center mb-4">
                    <h6 className="mb-2 text-warning">YOUR ELECTRICITY TOKEN</h6>
                    <h2 className="display-5 font-monospace text-white mb-0">
                      {formatToken(generatedToken.token)}
                    </h2>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Amount Paid:</strong> ₦{generatedToken.amount}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Units Purchased:</strong> {generatedToken.units} kWh</p>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Reference:</strong> {generatedToken.reference}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="alert alert-info mt-4">
                    <h6 className="mb-2">How to use your token:</h6>
                    <ol className="mb-0 small">
                      <li>Press the 'Enter' button on your meter</li>
                      <li>Enter the 20-digit token when prompted</li>
                      <li>Press 'Enter' again to confirm</li>
                      <li>Wait for the meter to validate and load the units</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedToken.token);
                    alert('Token copied to clipboard!');
                  }}
                >
                  <i className="fas fa-copy me-2"></i>Copy Token
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={printReceipt}
                >
                  <i className="fas fa-print me-2"></i>Print Receipt
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Token Modal */}
      {viewingToken && generatedToken && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-key me-2"></i>
                  Purchased Token
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setViewingToken(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="receipt p-4 border rounded">
                  <div className="text-center mb-4">
                    <h3 className="text-primary fw-bold">Noretek Energy</h3>
                    <h5 className="text-dark">ELECTRICITY TOKEN RECEIPT</h5>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Customer:</strong> {generatedToken.customerName || user?.email}</p>
                      <p><strong>Reference:</strong> {generatedToken.reference}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Meter Number:</strong> {generatedToken.meterNumber}</p>
                      <p><strong>Purchase Date:</strong> {selectedPayment?.created_at ? new Date(selectedPayment.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-dark text-light p-4 rounded text-center mb-4">
                    <h6 className="mb-2 text-warning">YOUR ELECTRICITY TOKEN</h6>
                    <h2 className="display-5 font-monospace text-white mb-0">
                      {formatToken(generatedToken.token)}
                    </h2>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Amount Paid:</strong> ₦{generatedToken.amount}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Units Purchased:</strong> {generatedToken.units} kWh</p>
                    </div>
                  </div>
                  
                  <div className="alert alert-info mt-4">
                    <h6 className="mb-2">How to use your token:</h6>
                    <ol className="mb-0 small">
                      <li>Press the 'Enter' button on your meter</li>
                      <li>Enter the 20-digit token when prompted</li>
                      <li>Press 'Enter' again to confirm</li>
                      <li>Wait for the meter to validate and load the units</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedToken.token);
                    alert('Token copied to clipboard!');
                  }}
                >
                  <i className="fas fa-copy me-2"></i>Copy Token
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={printReceipt}
                >
                  <i className="fas fa-print me-2"></i>Print Receipt
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setViewingToken(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Back Button */}
      <div className="row mb-4">
        <div className="col">
          <button 
            className="btn btn-outline-primary mb-3"
            onClick={() => router.push('/customer_dashboard')}
          >
            <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
          </button>
          <h2 className="h4 text-primary">Electricity Token Purchase</h2>
          <p className="text-muted h5">Welcome back, {user?.email}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      <div className="row mb-5">
        <div className="col-md-6">
          <PaymentForm
            userEmail={user?.email} 
            userId={user?.id} 
          />
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Payment History
              </h5>
            </div>
            <div className="card-body">
              {payments.length === 0 ? (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  No payments yet. Make your first payment!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
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
                        <tr key={payment.id}>
                          <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td>₦{payment.amount}</td>
                          <td>
                            <span className={`badge ${
                              payment.status === 'success' ? 'bg-success' : 
                              payment.status === 'pending' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="small text-muted">{payment.reference}</td>
                          <td>
                            <button
                              className={`btn btn-sm ${
                                payment.status === 'success' ? 'btn-outline-info' : 'btn-outline-secondary'
                              }`}
                              onClick={() => viewToken(payment)}
                              disabled={payment.status !== 'success'}
                              title={payment.status !== 'success' ? 'Only available for successful payments' : 'View Token'}
                            >
                              <i className="fas fa-eye me-1"></i>View Token
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

      {/* Add Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}