import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CartPage from './pages/CartPage';
import Payment from './pages/Payment'; // Add this import
import TrackOrder from './pages/TrackOrder';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import { api } from './services/api';
import OrderSuccess from './pages/OrderSuccess';
import './styles/App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token and products from API
  useEffect(() => {
    const token = localStorage.getItem('rypeToken');
    const savedUser = localStorage.getItem('rypeUser');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('rypeUser');
      }
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setError(null);
      const productsData = await api.getProducts();
      
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        console.error('Unexpected products format:', productsData);
        setProducts([]);
        setError('Invalid products data received');
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (!product || !product._id) {
      console.error('Invalid product:', product);
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { 
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1 
        }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Add this function for order creation
// Add this function to your App.js component
const handleCreateOrder = async (orderData) => {
  try {
    console.log('🔄 Creating order...', orderData);
    const result = await api.createOrder(orderData);
    
    if (result.success) {
      // Clear cart after successful order
      const updatedCart = [];
      localStorage.setItem('rypeCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      
      return result;
    } else {
      throw new Error(result.error || 'Failed to create order');
    }
  } catch (error) {
    console.error('❌ Order creation failed:', error);
    throw error;
  }
};

// Pass this function to Payment component
<Payment 
  user={user}
  onCreateOrder={handleCreateOrder}
  // ... other props
/>
  const handleLogin = async (credentials) => {
    try {
      const result = await api.login(credentials);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('rypeUser', JSON.stringify(result.user));
        localStorage.setItem('rypeToken', result.token);
        setShowAuth(false);
        setIsLogin(true);
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  const handleSignup = async (userData) => {
    try {
      const result = await api.register(userData);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('rypeUser', JSON.stringify(result.user));
        localStorage.setItem('rypeToken', result.token);
        setShowAuth(false);
        setIsLogin(true);
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  

  const handleLogout = () => {
    setUser(null);
    setCartItems([]);
    api.logout();
    localStorage.removeItem('rypeUser');
    localStorage.removeItem('rypeToken');
    window.location.href = '/';
  };

  const closeAuthModal = () => {
    setShowAuth(false);
    setIsLogin(true);
  };

  return (
    <Router>
      <div className="App">
        <Header 
          cartItems={cartItems} 
          user={user}
          onLoginClick={() => setShowAuth(true)}
          onLogout={handleLogout}
        />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/menu" 
              element={
                loading ? (
                  <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading fresh juices...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Failed to load menu</h3>
                    <p>{error}</p>
                    <button onClick={loadProducts} className="btn-primary">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <Menu products={products} onAddToCart={addToCart} />
                )
              } 
            />
            <Route
              path="/order-success"
              element={<OrderSuccess />} 
              />
            <Route 
              path="/cart" 
              element={
                <CartPage 
                  cartItems={cartItems}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onClearCart={clearCart}
                  user={user}
                  onAuthRequired={() => setShowAuth(true)}
                />
              } 
            />
            {/* Add Payment Route */}
            <Route 
              path="/payment" 
              element={
                <Payment 
                  user={user}
                  onCreateOrder={handleCreateOrder}
                />
              } 
            />
            <Route 
              path="/track" 
              element={
                <TrackOrder user={user} />
              } 
            />
            <Route 
              path="/history" 
              element={
                <OrderHistory user={user} />
              } 
            />
            <Route 
              path="/profile" 
              element={
                <Profile user={user} onUserUpdate={setUser} />
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminDashboard user={user} />
              } 
            />
          </Routes>
        </main>

        {/* Auth Modal */}
        {showAuth && (
          <div className="auth-modal">
            <div className="auth-modal-content">
              <button 
                className="close-button"
                onClick={closeAuthModal}
              >
                ×
              </button>
              {isLogin ? (
                <Login 
                  onLogin={handleLogin}
                  onSwitchToSignup={() => setIsLogin(false)}
                />
              ) : (
                <Signup 
                  onSignup={handleSignup}
                  onSwitchToLogin={() => setIsLogin(true)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;