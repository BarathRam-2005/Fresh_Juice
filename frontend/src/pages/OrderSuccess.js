import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total } = location.state || {};

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h1>Order Confirmed!</h1>
          <p className="success-message">
            Thank you for your order. Your fresh juices are being prepared.
          </p>
          
          <div className="order-details">
            <div className="detail-row">
              <span>Order ID:</span>
              <span>{orderId || 'RYPE_' + Date.now()}</span>
            </div>
            {total && (
              <div className="detail-row">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            )}
            <div className="detail-row">
              <span>Estimated Delivery:</span>
              <span>25-30 minutes</span>
            </div>
          </div>

          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/track')}
            >
              Track Your Order
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/menu')}
            >
              Order More
            </button>
          </div>

          <div className="delivery-info">
            <h3>What's Next?</h3>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <span className="step-text">Order confirmed and being prepared</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-text">Quality check and packaging</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-text">Out for delivery</span>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <span className="step-text">Delivered to your door</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;