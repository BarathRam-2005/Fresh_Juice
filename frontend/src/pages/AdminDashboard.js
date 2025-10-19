import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, statsResponse] = await Promise.all([
        api.getAdminOrders(),
        api.getAdminStats()
      ]);

      console.log('Orders data:', ordersResponse);
      console.log('Stats data:', statsResponse);

      if (ordersResponse.success) {
        setOrders(ordersResponse.orders || []);
      }
      if (statsResponse.success) {
        setStats(statsResponse.stats || {});
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const ordersResponse = await api.getAdminOrders();
      if (ordersResponse.success) {
        setOrders(ordersResponse.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await api.updateOrderStatus(orderId, newStatus);
      if (result.success) {
        // Refresh orders list
        fetchOrders();
      } else {
        alert('Failed to update order status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>🔒 Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage orders and monitor business performance</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders ({orders.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card revenue-card">
                <div className="stat-icon">💰</div>
                <h3>Total Revenue</h3>
                <p className="stat-number">₹{stats.revenue?.toFixed(2) || '0.00'}</p>
                <p className="stat-subtitle">All time sales</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <h3>Total Orders</h3>
                <p className="stat-number">{stats.totalOrders || 0}</p>
                <p className="stat-subtitle">All orders</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <h3>Total Customers</h3>
                <p className="stat-number">{stats.totalCustomers || 0}</p>
                <p className="stat-subtitle">Registered users</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🍊</div>
                <h3>Total Products</h3>
                <p className="stat-number">{stats.totalProducts || 0}</p>
                <p className="stat-subtitle">Available items</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <h3>Pending Orders</h3>
                <p className="stat-number">{stats.pendingOrders || 0}</p>
                <p className="stat-subtitle">Need attention</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <h3>Delivered Orders</h3>
                <p className="stat-number">{stats.deliveredOrders || 0}</p>
                <p className="stat-subtitle">Completed</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <h3>Avg Order Value</h3>
                <p className="stat-number">₹{stats.avgOrderValue?.toFixed(2) || '0.00'}</p>
                <p className="stat-subtitle">Per order</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🕒</div>
                <h3>Today's Revenue</h3>
                <p className="stat-number">₹{stats.todayRevenue?.toFixed(2) || '0.00'}</p>
                <p className="stat-subtitle">Daily sales</p>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('orders')}
                >
                  📦 View All Orders
                </button>
                <button 
                  className="btn-secondary"
                  onClick={fetchDashboardData}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            <div className="section-header">
              <h2>Order Management</h2>
              <div className="header-actions">
                <button 
                  className="btn-primary"
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                >
                  {ordersLoading ? '🔄 Loading...' : '🔄 Refresh Orders'}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setActiveTab('overview')}
                >
                  📊 Back to Overview
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No Orders Found</h3>
                <p>When customers place orders, they will appear here.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div className="order-basic-info">
                        <h3>Order #{order._id?.substring(18) || order._id}</h3>
                        <p className="order-time">
                          📅 {new Date(order.createdAt).toLocaleString()}
                        </p>
                        {order.estimatedDelivery && (
                          <p className="order-eta">
                            ⏰ Est. Delivery: {new Date(order.estimatedDelivery).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        )}
                      </div>
                      <div className="order-status-section">
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                        <p className="order-total">₹{order.total?.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="order-details-grid">
                      <div className="customer-info">
                        <h4>👤 Customer Information</h4>
                        <p><strong>Name:</strong> {order.customerInfo?.name || 'N/A'}</p>
                        <p><strong>Email:</strong> {order.customerInfo?.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {order.customerInfo?.phone || 'N/A'}</p>
                      </div>
                      
                      <div className="delivery-info">
                        <h4>📍 Delivery Address</h4>
                        <p>{order.address || 'Address not specified'}</p>
                      </div>

                      <div className="payment-info">
                        <h4>💳 Payment</h4>
                        <p><strong>Method:</strong> {order.paymentMethod || 'card'}</p>
                        <p><strong>Amount:</strong> ₹{order.total?.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="order-items">
                      <h4>🛒 Order Items</h4>
                      <div className="items-grid">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span className="item-image">{item.image || '🍊'}</span>
                            <div className="item-details">
                              <strong>{item.name}</strong>
                              <span>Quantity: {item.quantity}</span>
                            </div>
                            <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-actions">
                      <label>Update Order Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="preparing">👨‍🍳 Preparing</option>
                        <option value="quality-check">🔍 Quality Check</option>
                        <option value="out-for-delivery">🚚 Out for Delivery</option>
                        <option value="delivered">✅ Delivered</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;