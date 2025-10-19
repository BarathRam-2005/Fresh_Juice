import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ cartItems, user, onLoginClick, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const isAdmin = user && user.role === 'admin';

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">🍊</span>
          FreshJuice
        </Link>
        
        <nav className="nav">
          {/* Show different navigation for admin vs regular users */}
          {isAdmin ? (
            // Admin navigation - only show Dashboard
            <Link to="/admin">📊 Dashboard</Link>
          ) : (
            // Regular user navigation
            <>
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/track">Track Order</Link>
            </>
          )}
          
          {user ? (
            <div 
              className="user-menu"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="user-avatar">
                {user.role === 'admin' ? '👑' : '👤'}
              </div>
              <span>
                {user.role === 'admin' ? 'Admin' : `Hi, ${user.name?.split(' ')[0]}`}
              </span>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  {!isAdmin && (
                    <>
                      <Link to="/profile" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                        👤 Profile
                      </Link>
                      <Link to="/history" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                        📦 Order History
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                      📊 Admin Dashboard
                    </Link>
                  )}
                  <button 
                    className="user-dropdown-item logout"
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn-secondary"
              onClick={onLoginClick}
              style={{ border: '2px solid white', color: 'white', background: 'transparent' }}
            >
              Login
            </button>
          )}
          
          {/* Show cart only for regular users, not admin */}
          {!isAdmin && (
            <Link to="/cart" className="cart-link">
              🛒 Cart {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;