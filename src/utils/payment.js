export const initializePayment = async (email, amount, meterNumber, userId = null) => {
  try {
    console.log('🔄 Initializing payment for:', email, 'Amount:', amount, 'Meter:', meterNumber);

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
        },
        callback_url: `${window.location.origin}/customer_dashboard?payment_verify=true`
      })
    });

    // Check if response is OK first
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get response text first to debug
    const responseText = await response.text();
    console.log('📦 Payment initialization raw response:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError, 'Response text:', responseText);
      throw new Error('Invalid response from server');
    }

    console.log('📦 Payment initialization response:', data);

    if (data.status) {
      // Save meter number to localStorage for retrieval after payment
      localStorage.setItem('meterNumber', meterNumber);
      localStorage.setItem('userEmail', email);
      if (userId) {
        localStorage.setItem('userId', userId);
      }

      console.log('✅ Redirecting to Paystack:', data.data.authorization_url);
      // Redirect to Paystack payment page
      window.location.href = data.data.authorization_url;
    } else {
      console.error('❌ Payment initialization failed:', data.message);
      const errorMessage = data.message || 'Payment initialization failed';
      alert('Payment initialization failed: ' + errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('💥 Payment initialization error:', error);

    // More specific error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.message.includes('JSON parse error')) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw error;
    }
  }
};