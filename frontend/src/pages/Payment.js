import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = ({ user, onCreateOrder }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, subtotal, deliveryFee, tax, finalTotal } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!user) {
      setError('Please login to complete payment');
      return;
    }
  
    if (!cartItems || cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
  
    setIsProcessing(true);
    setError('');
  
    try {
      console.log('💰 Starting payment process...');
      
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: finalTotal,
        address: user.address || 'Address not specified',
        paymentMethod: paymentMethod
      };

      console.log('📦 Order data prepared:', orderData);

      // Call the order creation function
      if (onCreateOrder) {
        const result = await onCreateOrder(orderData);
        console.log('✅ Order creation result:', result);
        
        if (result.success && result.order) {
          console.log('🎉 Order created successfully, redirecting to track order');
          
          // Clear cart after successful order
          localStorage.removeItem('rypeCart');
          
          // Redirect to TrackOrder with the created order
          navigate('/track', { 
            state: { 
              order: result.order,
              message: 'Order placed successfully!'
            } 
          });
        } else {
          throw new Error(result.error || 'Order creation failed');
        }
      } else {
        throw new Error('Order creation function not available');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>No items in cart</h2>
            <p>Please add items to your cart before proceeding to payment</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/menu')}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="page-header">
          <h1>Payment</h1>
          <p>Complete your order with secure payment</p>
        </div>

        {error && (
          <div className="error-message" style={{marginBottom: '2rem', padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px'}}>
            {error}
          </div>
        )}

        <div className="payment-content">
          <div className="payment-main">
            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="radio-label">
                    <span className="payment-icon">💳</span>
                    Credit/Debit Card
                  </span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="radio-label">
                    <span className="payment-icon">📱</span>
                    UPI
                  </span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="radio-label">
                    <span className="payment-icon">💰</span>
                    Cash on Delivery
                  </span>
                </label>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="name"
                      value={cardDetails.name}
                      onChange={handleCardInputChange}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div className="upi-form">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                    />
                  </div>
                  <p className="upi-note">You will be redirected to your UPI app for payment</p>
                </div>
              )}

              {/* COD Notice */}
              {paymentMethod === 'cod' && (
                <div className="cod-notice">
                  <div className="notice-icon">💰</div>
                  <h4>Cash on Delivery</h4>
                  <p>Pay when your order arrives. Please keep exact change ready.</p>
                  <p className="cod-fee">+ ₹10 cash handling fee</p>
                </div>
              )}
            </div>

            <div className="payment-security">
              <div className="security-badge">
                <span className="lock-icon">🔒</span>
                <span>Secure Payment</span>
              </div>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>

          <div className="order-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <span className="item-name">{item.name} × {item.quantity}</span>
                    <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal?.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Delivery Fee:</span>
                <span>₹{deliveryFee}</span>
              </div>
              
              <div className="summary-row">
                <span>Tax (5%):</span>
                <span>₹{tax?.toFixed(2)}</span>
              </div>

              {paymentMethod === 'cod' && (
                <div className="summary-row">
                  <span>Cash Handling Fee:</span>
                  <span>₹10</span>
                </div>
              )}
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{(paymentMethod === 'cod' ? finalTotal + 10 : finalTotal).toFixed(2)}</span>
              </div>

              <button 
                className="pay-now-btn"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="loading-spinner"></div>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${(paymentMethod === 'cod' ? finalTotal + 10 : finalTotal).toFixed(2)}`
                )}
              </button>

              <button 
                className="back-to-cart"
                onClick={() => navigate('/cart')}
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;