import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveItem, user, onAuthRequired }) => {
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 29; // ₹29 delivery fee
  const tax = total * 0.05; // 5% tax
  const finalTotal = total + deliveryFee + tax;

  const handleCheckout = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    navigate('/payment', { 
      state: { 
        cartItems, 
        subtotal: total,
        deliveryFee,
        tax,
        finalTotal
      } 
    });
  };

  return (
    <div className="cart-page">
      <div className="container">
        <div className="page-header">
          <h1>Shopping Cart</h1>
          <p>Review your order and proceed to checkout</p>
        </div>

        {!user && (
          <div className="auth-required-card">
            <div className="auth-warning">
              <div className="warning-icon">🔒</div>
              <h3>Login Required</h3>
              <p>Please login to proceed with your order</p>
              <button 
                className="btn-primary"
                onClick={onAuthRequired}
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        )}

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some fresh juices to get started!</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/menu')}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="cart-with-items">
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <h2>Order Items ({cartItems.length})</h2>
                </div>
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <div className="item-image">{item.image}</div>
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p className="item-price">₹{item.price}</p>
                        </div>
                      </div>
                      
                      <div className="quantity-controls">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      
                      <button 
                        className="remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cart-summary">
                <div className="summary-card">
                  <h3>Order Summary</h3>
                  
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Delivery Fee:</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Tax (5%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>

                  <button 
                    className={`checkout-btn ${!user ? 'disabled' : ''}`}
                    onClick={handleCheckout}
                    disabled={!user}
                  >
                    {user ? 'Proceed to Payment' : 'Login to Checkout'}
                  </button>
                  
                  {!user && (
                    <p className="login-prompt">
                      Please login to complete your order
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;