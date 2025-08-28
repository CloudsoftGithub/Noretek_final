'use client';
import { useState, useEffect } from 'react';

export default function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!meterNumber) {
        throw new Error('Please enter your meter number');
      }

      if (!amount) {
        throw new Error('Please enter an amount');
      }

      const amountNum = parseInt(amount);
      
      if (isNaN(amountNum) || amountNum < 100) {
        throw new Error('Minimum amount is ₦100');
      }

      // Store meter number
      localStorage.setItem('meterNumber', meterNumber);

      // Initialize payment
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          amount: amountNum,
          meterNumber: meterNumber,
          metadata: {
            user_id: 'user-' + Date.now(), // Generate a unique ID
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
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Make Payment</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="meterNumber" className="form-label">Meter Number *</label>
            <input
              type="text"
              className="form-control"
              id="meterNumber"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
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
              value={amount}
              onChange={handleAmountChange}
              min="100"
              step="100"
              required
              placeholder="Enter amount in Naira"
            />
            <div className="form-text">Minimum amount: ₦100</div>
          </div>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || !userEmail}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
          {!userEmail && (
            <div className="alert alert-warning mt-3" role="alert">
              Please login to make a payment
            </div>
          )}
        </form>
      </div>
    </div>
  );
}