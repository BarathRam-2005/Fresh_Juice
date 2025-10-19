import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Fresh Orange Juice Delivered to Your Door</h1>
          <p>100% natural, freshly squeezed oranges. Delivered in under 30 minutes.</p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn-primary">Order Now</Link>
            <Link to="/track" className="btn-secondary">Track Order</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="juice-display">🍊✨</div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <h3>Quick Delivery</h3>
          <p>Delivered in 25-35 minutes</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🎯</div>
          <h3>Always Fresh</h3>
          <p>Squeezed to order, never stored</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💚</div>
          <h3>100% Natural</h3>
          <p>No additives or preservatives</p>
        </div>
      </section>
    </div>
  );
};

export default Home;