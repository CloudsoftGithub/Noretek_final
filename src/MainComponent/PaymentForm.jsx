// MainComponent/PaymentForm.jsx
import { useState } from 'react';

export default function PaymentForm({ userEmail, userId }) {
  const [amount, setAmount] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const initializePayment = async (email, amount, meterNumber, userId = null) => {
    try {
      console.log('🔄 Initializing payment for:', email);
      
      // Save user data to localStorage for retrieval after payment
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('meterNumber', meterNumber);
        if (userId) {
          localStorage.setItem('userId', userId);
        }
      }
      
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          metadata: {
            meterNumber,
            user_id: userId
          }
        })
      });
      
      const data = await response.json();
      
      console.log('📦 Payment initialization response:', data);
      
      if (data.status) {
        console.log('✅ Redirecting to Paystack');
        if (typeof window !== 'undefined') {
          window.location.href = data.data.authorization_url;
        }
      } else {
        throw new Error(data.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('💥 Payment initialization error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount < 100) {
      alert('Minimum amount is ₦100');
      return;
    }
    
    setLoading(true);
    
    try {
      await initializePayment(userEmail, parseFloat(amount), meterNumber, userId);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bColor">
        <h5 className="mb-0">Purchase Meter Token</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              value={userEmail}
              disabled
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Meter Number:</label>
            <input
              type="text"
              className="form-control shadow-none"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              required
              placeholder="Enter your meter number"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Amount (NGN):</label>
            <input
              type="number"
              className="form-control shadow-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              step="50"
              required
              placeholder="Enter amount"
            />
            <details className="form-text titleColor">Minimum amount: ₦100</details>
          </div>
          
          <button 
            type="submit" 
            className="btn bColor w-100 font-monospace"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>
        
        <div className="mt-3 p-3 bg-light rounded">
          <h6 className='titleColor'>Test Card Details:</h6>
          <small className="text-muted">
            Card: 408 408 408 408 1<br/>
            Expiry: Any future date<br/>
            CVV: 408, PIN: 0000, OTP: 123456
          </small>
        </div>
      </div>
    </div>
  );
}