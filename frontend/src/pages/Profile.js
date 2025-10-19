import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('rypeUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setFormData(userData);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // In a real app, you'd have an API endpoint to update user profile
      // For now, we'll update localStorage
      localStorage.setItem('rypeUser', JSON.stringify(formData));
      setUser(formData);
      setEditMode(false);
      setMessage('Profile updated successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span className="user-role">{user.role}</span>
            </div>
            <button 
              className="btn-secondary"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="Enter your complete delivery address"
                rows="3"
              />
            </div>

            {editMode && (
              <div className="form-actions">
                <button 
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>📦 Total Orders</h3>
            <p>View your order history</p>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/history')}
            >
              View Order History
            </button>
          </div>

          <div className="stat-card">
            <h3>⭐ Favorite Juices</h3>
            <p>Discover your most ordered items</p>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/menu')}
            >
              Browse Menu
            </button>
          </div>

          {user.role === 'admin' && (
            <div className="stat-card admin-card">
              <h3>👑 Admin Panel</h3>
              <p>Manage orders and view analytics</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/admin')}
              >
                Go to Admin Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;