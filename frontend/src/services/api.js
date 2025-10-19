const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('rypeToken');
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  async request(endpoint, options = {}) {
    const token = getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      console.log(`🔄 API Call: ${url}`, config);
      const response = await fetch(url, config);
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  },

  // Auth endpoints
  async register(userData) {
    const result = await this.request('/register', {
      method: 'POST',
      body: userData
    });
    if (result.token) {
      localStorage.setItem('rypeToken', result.token);
      localStorage.setItem('rypeUser', JSON.stringify(result.user));
    }
    return result;
  },

  async login(credentials) {
    const result = await this.request('/login', {
      method: 'POST',
      body: credentials
    });
    if (result.token) {
      localStorage.setItem('rypeToken', result.token);
      localStorage.setItem('rypeUser', JSON.stringify(result.user));
    }
    return result;
  },

  logout() {
    localStorage.removeItem('rypeToken');
    localStorage.removeItem('rypeUser');
    localStorage.removeItem('rypeCurrentOrder');
  },

  // Products endpoints - FIXED
  async getProducts() {
    const result = await this.request('/products');
    
    // Handle different response formats
    if (result.success && Array.isArray(result.products)) {
      return result.products;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      console.warn('Unexpected products response format:', result);
      return [];
    }
  },

  async getProduct(id) {
    const result = await this.request(`/products/${id}`);
    return result.product || result;
  },

  // Orders endpoints - FIXED
  async createOrder(orderData) {
    console.log('📦 Creating order with data:', orderData);
    const result = await this.request('/orders', {
      method: 'POST',
      body: orderData
    });
    console.log('✅ Order creation response:', result);
    return result;
  },

  async getUserOrders() {
    const result = await this.request('/orders/my-orders');
    return result;
  },

  async getOrder(orderId) {
    const result = await this.request(`/orders/${orderId}`);
    return result;
  },

  // Admin endpoints
  async getAdminStats() {
    const result = await this.request('/admin/stats');
    return result;
  },

  async getAdminOrders() {
    const result = await this.request('/admin/orders');
    return result;
  },

  async updateOrderStatus(orderId, status) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status }
    });
  },

  // User profile endpoints
  async getProfile() {
    const result = await this.request('/profile');
    return result;
  },

  async updateProfile(profileData) {
    return this.request('/profile', {
      method: 'PUT',
      body: profileData
    });
  }
};