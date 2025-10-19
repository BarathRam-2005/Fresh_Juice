import React from 'react';

const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some fresh juices to get started!</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Your Order</h2>
      
      {cartItems.map(item => (
        <div key={item.id} className="cart-item">
          <div className="item-info">
            <span className="item-image">{item.image}</span>
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>${item.price}</p>
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
            ${(item.price * item.quantity).toFixed(2)}
          </div>
          
          <button 
            className="remove-btn"
            onClick={() => onRemoveItem(item.id)}
          >
            🗑️
          </button>
        </div>
      ))}
      
      <div className="cart-total">
        <h3>Total: ${total.toFixed(2)}</h3>
      </div>
      
      <button className="checkout-btn" onClick={onCheckout}>
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Cart;