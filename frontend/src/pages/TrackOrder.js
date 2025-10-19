import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OrderTracker from '../components/OrderTracker';
import { api } from '../services/api';
import './TrackOrder.css';

const TrackOrder = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('rypeUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('User loaded:', userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      console.log('No user found in localStorage');
      setLoading(false);
    }
  }, []);

  // Save order to localStorage whenever it changes
  useEffect(() => {
    if (order) {
      localStorage.setItem('rypeCurrentOrder', JSON.stringify({
        order,
        timestamp: new Date().toISOString(),
        timeElapsed,
        currentStage
      }));
      console.log('Order saved to localStorage');
    }
  }, [order, timeElapsed, currentStage]);

  // Load order from localStorage or location state
  useEffect(() => {
    console.log('Location state:', location.state);
    
    // First, check if we have a new order from location state
    if (location.state?.order) {
      console.log('New order received from location state');
      const newOrder = location.state.order;
      setOrder(newOrder);
      setTimeElapsed(0);
      setCurrentStage(0);
      
      // Clear any old order from localStorage and set new one
      localStorage.setItem('rypeCurrentOrder', JSON.stringify({
        order: newOrder,
        timestamp: new Date().toISOString(),
        timeElapsed: 0,
        currentStage: 0
      }));
      
      setLoading(false);
      return;
    }

    // If no location state, check localStorage for existing order
    const savedOrderData = localStorage.getItem('rypeCurrentOrder');
    if (savedOrderData) {
      try {
        const orderData = JSON.parse(savedOrderData);
        console.log('Found saved order in localStorage:', orderData);
        
        // Check if the order is still valid (less than 15 minutes old)
        const savedTime = new Date(orderData.timestamp);
        const currentTime = new Date();
        const minutesSinceSaved = Math.floor((currentTime - savedTime) / (1000 * 60));
        
        if (minutesSinceSaved < 15) { // Keep order for 15 minutes
          console.log('Order is still valid, loading from localStorage');
          setOrder(orderData.order);
          setTimeElapsed(orderData.timeElapsed + minutesSinceSaved); // Add elapsed time since last save
          setCurrentStage(orderData.currentStage);
        } else {
          console.log('Order is too old, clearing from localStorage');
          localStorage.removeItem('rypeCurrentOrder');
        }
      } catch (e) {
        console.error('Error parsing saved order data:', e);
        localStorage.removeItem('rypeCurrentOrder');
      }
    }
    
    setLoading(false);
  }, [location.state]);

  // Fetch user's latest order from API only if no order from localStorage or location state
  useEffect(() => {
    const fetchLatestOrder = async () => {
      if (!user || order) { // Don't fetch if we already have an order
        return;
      }

      try {
        console.log('Fetching latest order from API for user:', user.id);
        const ordersResponse = await api.getUserOrders();
        console.log('Orders API response:', ordersResponse);
        
        if (ordersResponse.success && Array.isArray(ordersResponse.orders) && ordersResponse.orders.length > 0) {
          // Get the most recent order
          const latestOrder = ordersResponse.orders[0];
          console.log('Latest order found from API:', latestOrder);
          
          // Check if this order is recent (within 15 minutes)
          const orderTime = new Date(latestOrder.createdAt);
          const currentTime = new Date();
          const minutesSinceOrder = Math.floor((currentTime - orderTime) / (1000 * 60));
          
          if (minutesSinceOrder < 15) {
            setOrder(latestOrder);
            setTimeElapsed(minutesSinceOrder);
            
            // Set initial stage based on order status and time
            const stage = calculateStageBasedOnTime(minutesSinceOrder, latestOrder.status);
            setCurrentStage(stage);
            
            // Save to localStorage
            localStorage.setItem('rypeCurrentOrder', JSON.stringify({
              order: latestOrder,
              timestamp: new Date().toISOString(),
              timeElapsed: minutesSinceOrder,
              currentStage: stage
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching order from API:', error);
      }
    };

    if (user && !order && !loading) {
      fetchLatestOrder();
    }
  }, [user, order, loading]);

  // Calculate stage based on time and status
  const calculateStageBasedOnTime = (minutes, status) => {
    const statusToStage = {
      'pending': 0,
      'preparing': 1,
      'quality-check': 2,
      'out-for-delivery': 3,
      'delivered': 4
    };
    
    // If we have a status, use it
    if (status && statusToStage[status] !== undefined) {
      return statusToStage[status];
    }
    
    // Otherwise calculate based on time
    if (minutes >= 15) return 4; // Delivered
    if (minutes >= 8) return 3;  // Out for delivery
    if (minutes >= 5) return 2;  // Quality check
    if (minutes >= 2) return 1;  // Preparing
    return 0; // Order placed
  };

  // Simulate order progress
  useEffect(() => {
    if (!order) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        console.log(`Time elapsed: ${newTime} minutes, Current stage: ${currentStage}`);
        
        // Auto-progress through stages based on time
        if (newTime >= 2 && currentStage < 1) {
          setCurrentStage(1); // Move to preparing
        } else if (newTime >= 5 && currentStage < 2) {
          setCurrentStage(2); // Move to quality check
        } else if (newTime >= 8 && currentStage < 3) {
          setCurrentStage(3); // Move to out for delivery
        } else if (newTime >= 15 && currentStage < 4) {
          setCurrentStage(4); // Move to delivered
          
          // Clear order from localStorage after 15 minutes when delivered
          setTimeout(() => {
            localStorage.removeItem('rypeCurrentOrder');
            console.log('Order cleared from localStorage after completion');
          }, 5000); // Clear 5 seconds after delivery
        }

        // Simulate delivery person assignment
        if (currentStage >= 3 && !deliveryPerson) {
          setDeliveryPerson({
            name: 'Raj Kumar',
            rating: 4.8,
            vehicle: '🚴 Bicycle',
            phone: '+91 98765 43210',
            location: '1.2 km away',
            eta: `${Math.max(1, 25 - newTime)} minutes`
          });
        }

        return newTime;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [order, deliveryPerson, currentStage]);

  // Clear order after 15 minutes (safety mechanism)
  useEffect(() => {
    if (timeElapsed >= 15) {
      const timer = setTimeout(() => {
        console.log('Auto-clearing order after 15 minutes');
        localStorage.removeItem('rypeCurrentOrder');
        setOrder(null);
      }, 300000); // 5 minutes after delivery (20 minutes total)
      
      return () => clearTimeout(timer);
    }
  }, [timeElapsed]);

  // Debug: Log current state
  useEffect(() => {
    console.log('Current TrackOrder state:', {
      user: !!user,
      order: !!order,
      loading,
      timeElapsed,
      currentStage,
      hasLocationState: !!location.state?.order
    });
  }, [user, order, loading, timeElapsed, currentStage, location.state]);

  // Clear current order (manual function)
  const clearCurrentOrder = () => {
    localStorage.removeItem('rypeCurrentOrder');
    setOrder(null);
    setTimeElapsed(0);
    setCurrentStage(0);
    setDeliveryPerson(null);
    console.log('Order manually cleared');
  };

  // Redirect to menu if no user
  if (!user) {
    return (
      <div className="track-order-page">
        <div className="empty-state">
          <div className="empty-icon">🔐</div>
          <h2>Please Login to Track Orders</h2>
          <p>You need to be logged in to view your order tracking information.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="track-order-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="track-order-page">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No Active Orders</h2>
          <p>You haven't placed any orders recently, or your previous order has been completed.</p>
          <div className="empty-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/menu')}
            >
              Order Fresh Juices
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/history')}
            >
              View Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderStages = [
    { 
      id: 1, 
      name: "Order Placed", 
      description: "We've received your order and payment",
      icon: "📝",
      time: "Just now"
    },
    { 
      id: 2, 
      name: "Preparing", 
      description: "Squeezing fresh fruits and preparing your juices",
      icon: "👨‍🍳",
      time: "3-5 minutes"
    },
    { 
      id: 3, 
      name: "Quality Check", 
      description: "Ensuring perfect taste and freshness",
      icon: "🔍",
      time: "2-3 minutes"
    },
    { 
      id: 4, 
      name: "Out for Delivery", 
      description: "Your juices are on the way!",
      icon: "🚚",
      time: "10-15 minutes"
    },
    { 
      id: 5, 
      name: "Delivered", 
      description: "Enjoy your fresh juices!",
      icon: "✅",
      time: "Arrived"
    }
  ];

  const progressPercentage = Math.min((timeElapsed / 15) * 100, 100);

  return (
    <div className="track-order-page">
      <div className="page-header">
        <h1>Track Your Order</h1>
        <p>Order #{order._id?.substring(18) || order.id} • Placed {new Date(order.createdAt).toLocaleTimeString()}</p>
        <button 
          className="clear-order-btn"
          onClick={clearCurrentOrder}
          title="Clear this order"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Delivery Progress</h3>
          <span className="time-elapsed">{timeElapsed} min elapsed</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>Ordered</span>
          <span>Estimated: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '15-20 minutes'}</span>
        </div>
      </div>

      {/* Order Tracker */}
      <OrderTracker 
        currentStage={currentStage}
        orderStages={orderStages}
        timeElapsed={timeElapsed}
      />

      {/* Delivery Person Info */}
      {deliveryPerson && (
        <div className="delivery-person-card">
          <h3>🛵 Your Delivery Partner</h3>
          <div className="delivery-person-info">
            <div className="person-details">
              <div className="person-avatar">{deliveryPerson.name.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <h4>{deliveryPerson.name}</h4>
                <p>⭐ {deliveryPerson.rating} • {deliveryPerson.vehicle}</p>
                <p className="location">📍 {deliveryPerson.location}</p>
                <p>ETA: {deliveryPerson.eta}</p>
              </div>
            </div>
            <div className="delivery-actions">
              <button className="btn-secondary">📞 Call</button>
              <button className="btn-secondary">💬 Message</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="order-details-card">
        <h3>Your Order Details</h3>
        
        <div className="order-items-list">
          <h4>Items Ordered:</h4>
          {order.items && order.items.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-info">
                <span className="item-image">{item.image || '🍊'}</span>
                <div>
                  <strong>{item.name || 'Fresh Juice'}</strong>
                  <p>Quantity: {item.quantity || 1}</p>
                </div>
              </div>
              <span className="item-price">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="order-total">
          <strong>Total: ₹{order.total?.toFixed(2) || '0.00'}</strong>
        </div>
        
        <div className="delivery-info">
          <h4>Delivery Information:</h4>
          <div className="info-item">
            <span>📦 Delivery Address:</span>
            <span>{order.address || user.address || 'Address not specified'}</span>
          </div>
          <div className="info-item">
            <span>👤 Customer:</span>
            <span>{user.name}</span>
          </div>
          <div className="info-item">
            <span>📞 Contact:</span>
            <span>{user.phone || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span>⏰ Ordered at:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span>💳 Payment Method:</span>
            <span>{order.paymentMethod || 'Card'}</span>
          </div>
          <div className="info-item">
            <span>⏱️ Time Elapsed:</span>
            <span>{timeElapsed} minutes</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="track-order-actions">
        <button 
          className="btn-primary"
          onClick={() => navigate('/menu')}
        >
          Order More Juices
        </button>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/history')}
        >
          View Order History
        </button>
        <button 
          className="btn-secondary"
          onClick={clearCurrentOrder}
        >
          Clear This Order
        </button>
      </div>
    </div>
  );
};

export default TrackOrder;