import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      const result = await api.getUserOrders();
      if (result.success) {
        setOrders(result.orders);
      } else {
        setError('Failed to load order history');
      }
    } catch (error) {
      console.error('Failed to load order history:', error);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'var(--success)';
      case 'cancelled': return 'var(--error)';
      case 'pending': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="page-header">
        <h1>Order History</h1>
        <p>View your past orders and track current ones</p>
      </div>

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadOrderHistory} className="btn-primary">
            Try Again
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start by exploring our delicious juices!</p>
          <div className="empty-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/menu')}
            >
              Browse Menu
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order {order.orderId}</h3>
                  <span 
                    className="order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="order-meta">
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span className="order-total">${order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-image">{item.image}</span>
                      <div className="item-details">
                        <strong>{item.name}</strong>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-footer">
                <div className="delivery-info">
                  <strong>Delivery to:</strong>
                  <span>{order.address}</span>
                </div>
                <div className="order-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => navigate('/track')}
                  >
                    Track Order
                  </button>
                  {order.status === 'delivered' && (
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/menu')}
                    >
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;