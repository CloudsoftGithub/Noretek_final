// MainComponent/PaymentForm.jsx
import { useState, useEffect } from 'react';

export default function PaymentForm({ userEmail, userId }) {
  const [amount, setAmount] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [fetchingMeter, setFetchingMeter] = useState(true);

  // Fetch user data including meter number
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchingMeter(true);
        
        // Try to get from localStorage first
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          if (parsedData.meterId) {
            setMeterNumber(parsedData.meterId);
          }
        }
        
        // Also try to fetch from API if available
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const apiUserData = await response.json();
            setUserData(apiUserData);
            if (apiUserData.meterId || apiUserData.meterNumber) {
              setMeterNumber(apiUserData.meterId || apiUserData.meterNumber);
            }
          }
        } catch (apiError) {
          console.log('API fetch not available, using localStorage data');
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setFetchingMeter(false);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const initializePayment = async (email, amount, meterNumber, userId = null) => {
    try {
      console.log('🔄 Initializing payment for:', email);
      
      // Validate meter number
      if (!meterNumber || meterNumber.trim() === '') {
        throw new Error('Meter number is required');
      }
      
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
            meterNumber: meterNumber.trim(),
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
    
    if (!meterNumber || meterNumber.trim() === '') {
      alert('Please enter your meter number');
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

  const handleMeterNumberChange = (e) => {
    const value = e.target.value;
    // Basic validation - allow only alphanumeric characters and dashes
    if (/^[a-zA-Z0-9-]*$/.test(value)) {
      setMeterNumber(value);
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
            {fetchingMeter ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading your meter number...</span>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  className="form-control shadow-none"
                  value={meterNumber}
                  onChange={handleMeterNumberChange}
                  required
                  placeholder="Enter your meter number"
                  maxLength={20}
                />
                {userData?.meterId && (
                  <div className="form-text text-success">
                    Your registered meter: {userData.meterId}
                  </div>
                )}
              </>
            )}
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
            <div className="form-text titleColor">Minimum amount: ₦100</div>
          </div>
          
          <button 
            type="submit" 
            className="btn bColor w-100 font-monospace"
            disabled={loading || fetchingMeter}
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

        {/* Help section for meter number issues */}
        {!fetchingMeter && (!meterNumber || meterNumber.trim() === '') && (
          <div className="mt-3 p-3 bg-warning bg-opacity-10 rounded">
            <h6 className="text-warning">Don&apos;t know your meter number?</h6>
            <small className="text-muted">
              • Check your electricity bill<br/>
              • Look at your physical meter<br/>
              • Contact support if you need help
            </small>
          </div>
        )}
      </div>
    </div>
  );
}