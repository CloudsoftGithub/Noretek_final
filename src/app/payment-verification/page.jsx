'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Create a separate component that uses useSearchParams
function PaymentVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyPayment = async () => {
      const ref = searchParams.get('reference') || searchParams.get('trxref');
      setReference(ref);
      
      console.log('🔍 Payment verification started with reference:', ref);

      if (!ref) {
        setStatus('error');
        setMessage('No payment reference provided. Please check your payment and try again.');
        return;
      }

      try {
        console.log('📞 Calling verify API...');
        const response = await fetch(`/api/payments/verify?reference=${ref}`);
        const data = await response.json();
        
        console.log('📦 Verification API response:', data);
        
        if (data.status && data.data.status === 'success') {
          setStatus('success');
          
          // Check if token was generated
          if (data.tokenData && data.tokenData.success) {
            setTokenInfo(data.tokenData);
            setMessage('Payment successful! Your token has been generated automatically.');
            
            // Save token details to localStorage
            localStorage.setItem('lastToken', data.tokenData.token);
            localStorage.setItem('lastMeter', data.tokenData.meterNumber);
            localStorage.setItem('lastUnits', data.tokenData.units);
            localStorage.setItem('lastAmount', data.tokenData.amount);
          } else {
            setMessage('Payment successful! However, token generation is pending. Please check your dashboard.');
          }
          
          // Start countdown for redirect
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                redirectToDashboard();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
        } else {
          setStatus('error');
          setMessage(data.message || `Payment failed. Status: ${data.data?.status || 'unknown'}`);
        }
      } catch (error) {
        console.error('💥 Payment verification error:', error);
        setStatus('error');
        setMessage('Payment verification failed. Please try again or contact support if the problem persists.');
      }
    };

    const redirectToDashboard = () => {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        router.push(`/customer_dashboard?email=${encodeURIComponent(userEmail)}&payment_success=true&ref=${reference}`);
      } else {
        router.push('/customer_dashboard?payment_success=true');
      }
    };

    if (searchParams) {
      verifyPayment();
    }
  }, [searchParams, router]);

  const handleManualRedirect = () => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      router.push(`/customer_dashboard?email=${encodeURIComponent(userEmail)}&payment_success=true&ref=${reference}`);
    } else {
      router.push('/customer_dashboard?payment_success=true');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h3 mb-0">Payment Status</h2>
            </div>
            <div className="card-body p-5 text-center">
              
              {status === 'verifying' && (
                <div>
                  <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4 className="text-primary">Verifying Payment...</h4>
                  <p className="text-muted">Please wait while we verify your transaction and generate your token.</p>
                  {reference && (
                    <div className="mt-3">
                      <small className="text-muted">Reference: {reference}</small>
                    </div>
                  )}
                </div>
              )}
              
              {status === 'success' && (
                <div>
                  <div className="text-success mb-3" style={{ fontSize: '4rem' }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="alert alert-success">
                    <h4 className="alert-heading">Payment Successful!</h4>
                    <p className="mb-2">{message}</p>
                    
                    {/* Display token if available */}
                    {tokenInfo && tokenInfo.token && (
                      <div className="mt-3">
                        <h5>Your Electricity Token:</h5>
                        <div className="bg-dark text-light p-3 rounded mt-2">
                          <h4 className="mb-0">{tokenInfo.token}</h4>
                        </div>
                        <div className="mt-2">
                          <small>
                            Meter: {tokenInfo.meterNumber} | 
                            Units: {tokenInfo.units} kWh | 
                            Amount: ₦{tokenInfo.amount}
                          </small>
                        </div>
                      </div>
                    )}
                    
                    {countdown > 0 && (
                      <p className="mb-0 mt-3">Redirecting in {countdown} seconds...</p>
                    )}
                  </div>
                  
                  <button 
                    className="btn btn-success btn-lg mt-3"
                    onClick={handleManualRedirect}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Go to Dashboard Now
                  </button>
                </div>
              )}
              
              {status === 'error' && (
                <div>
                  <div className="text-danger mb-3" style={{ fontSize: '4rem' }}>
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <div className="alert alert-danger">
                    <h4 className="alert-heading">Payment Failed</h4>
                    <p className="mb-0">{message}</p>
                  </div>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <button 
                      className="btn btn-primary me-md-2"
                      onClick={() => router.push('/customer_dashboard')}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Dashboard
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => router.push('/')}
                    >
                      <i className="fas fa-home me-2"></i>
                      Go to Homepage
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentVerification() {
  return (
    <Suspense fallback={
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white text-center">
                <h2 className="h3 mb-0">Payment Status</h2>
              </div>
              <div className="card-body p-5 text-center">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="text-primary">Loading Payment Verification...</h4>
                <p className="text-muted">Please wait while we prepare to verify your payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentVerificationContent />
    </Suspense>
  );
}