// src/app/payment-verification/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      // Paystack sends reference as both 'reference' and 'trxref'
      const ref = searchParams.get('reference') || searchParams.get('trxref');
      setReference(ref);
      
      console.log('🔍 Payment verification started with reference:', ref);

      if (!ref) {
        setStatus('error');
        setMessage('No payment reference provided');
        return;
      }

      try {
        console.log('📞 Calling verify API...');
        const response = await fetch(`/api/payments/verify?reference=${ref}`);
        const data = await response.json();
        
        console.log('📦 Verification API response:', data);
        
        if (data.status && data.data.status === 'success') {
          setStatus('success');
          setMessage('Payment successful! Redirecting to dashboard...');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            console.log('🔄 Redirecting to dashboard');
            router.push('/customer_dashboard?payment_success=true&ref=' + ref);
          }, 3000);
          
        } else {
          setStatus('error');
          setMessage(data.message || `Payment failed. Status: ${data.data?.status || 'unknown'}`);
        }
      } catch (error) {
        console.error('💥 Payment verification error:', error);
        setStatus('error');
        setMessage('Payment verification failed. Please try again.');
      }
    };

    if (searchParams) {
      verifyPayment();
    }
  }, [searchParams, router]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-light text-center">
              <h2 className="h3 mb-0">Payment Status</h2>
            </div>
            <div className="card-body p-5 text-center">
              
              {status === 'verifying' && (
                <div>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4 className="text-primary">Verifying Payment...</h4>
                  <p className="text-muted">Please wait while we verify your transaction.</p>
                  {reference && <small className="text-muted">Reference: {reference}</small>}
                </div>
              )}
              
              {status === 'success' && (
                <div>
                  <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                    ✅
                  </div>
                  <div className="alert alert-success mb-4">
                    <h5 className="alert-heading text-primary">Payment Successful!</h5>
                    <p className="mb-0">{message}</p>
                  </div>
                  <p className="text-primary">You will be redirected automatically...</p>
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => router.push('/customer_dashboard')}
                  >
                    Go to Dashboard Now
                  </button>
                </div>
              )}
              
              {status === 'error' && (
                <div>
                  <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>
                    ❌
                  </div>
                  <div className="alert alert-danger mb-4">
                    <h5 className="alert-heading">Payment Failed</h5>
                    <p className="mb-0">{message}</p>
                  </div>
                  
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => router.push('/customer_dashboard')}
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}