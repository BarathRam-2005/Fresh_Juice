require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rype', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
  initializeData();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});


const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const emailService = {
  sendOrderConfirmation: async (user, order) => {
    console.log(`📧 Order confirmation sent to ${user.email} for order #${order._id}`);
    return true;
  },
  sendOrderStatusUpdate: async (user, order, status) => {
    console.log(`📧 Status update sent to ${user.email}: Order #${order._id} is now ${status}`);
    return true;
  }
};

// Initialize data
const initializeData = async () => {
  try {
    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@rype.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'Rype Admin',
        email: 'admin@rype.com',
        password: hashedPassword,
        phone: '+91-9876543210',
        address: 'Rype Headquarters, Mumbai',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@rype.com / admin123');
    }

    // Create test customer if not exists
    const customerExists = await User.findOne({ email: 'customer@rype.com' });
    if (!customerExists) {
      const hashedPassword = await bcrypt.hash('customer123', 12);
      await User.create({
        name: 'Test Customer',
        email: 'customer@rype.com',
        password: hashedPassword,
        phone: '+91-9876543211',
        address: '123 Customer Street, Delhi',
        role: 'customer'
      });
      console.log('✅ Test customer created: customer@rype.com / customer123');
    }

    // Create products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const productsData = [
        {
          name: "Classic Orange Bliss",
          price: 199,
          image: "🍊",
          description: "Pure, freshly squeezed orange juice with natural sweetness",
          ingredients: ["Fresh Valencia Oranges"],
          size: "500ml",
          nutrition: { calories: 110, vitaminC: "120%", sugar: "22g", protein: "2g", carbs: "26g" },
          category: "classic",
          featured: true,
          popularity: 150
        },
        // Add more products as needed...
      ];
      await Product.insertMany(productsData);
      console.log(`✅ ${productsData.length} products created`);
    }
  } catch (error) {
    console.error('❌ Data initialization error:', error);
  }
};

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    
    res.json({ 
      status: 'OK', 
      message: 'Rype API is running!',
      timestamp: new Date(),
      usersCount,
      ordersCount,
      productsCount,
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ 
      status: 'Error', 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email, and password are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists with this email' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 'customer'
    });

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
});

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    const products = await Product.find(filter).sort({ popularity: -1, createdAt: -1 });
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('❌ Products error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products' 
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('❌ Product detail error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch product' 
    });
  }
});

// Orders routes - FIXED VERSION
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body;
    
    console.log('📦 Creating order with data:', { items, total, address, paymentMethod });
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item'
      });
    }

    // Validate total
    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid total amount is required'
      });
    }

    // Transform items to match schema
    const orderItems = items.map(item => ({
      productId: item.id || item._id, // Handle both id and _id
      name: item.name || 'Fresh Juice',
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || '🍊'
    }));

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      total: parseFloat(total),
      address: address || req.user.address || 'Address not specified',
      customerInfo: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || 'Not provided'
      },
      paymentMethod: paymentMethod || 'card',
      estimatedDelivery: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes
      status: 'pending'
    });

    console.log('✅ Order created successfully:', order._id);

    // Send order confirmation email
    await emailService.sendOrderConfirmation(req.user, order);

    // Update product popularity
    for (const item of items) {
      await Product.findByIdAndUpdate(item.id || item._id, { 
        $inc: { popularity: item.quantity || 1 } 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order: ' + error.message 
    });
  }
});

app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name image');
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('❌ Get user orders error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch orders' 
    });
  }
});

app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      userId: req.user._id 
    }).populate('items.productId', 'name image description');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch order' 
    });
  }
});

// Admin routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const preparingOrders = await Order.countDocuments({ status: 'preparing' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const revenue = revenueResult[0]?.total || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenueResult = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          createdAt: { $gte: today }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$total' } 
        } 
      }
    ]);
    
    const todayRevenue = todayRevenueResult[0]?.total || 0;

    const avgOrderValueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { 
        $group: { 
          _id: null, 
          avgValue: { $avg: '$total' } 
        } 
      }
    ]);
    
    const avgOrderValue = avgOrderValueResult[0]?.avgValue || 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        preparingOrders,
        deliveredOrders,
        revenue: parseFloat(revenue.toFixed(2)),
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        totalCustomers,
        totalProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch admin stats' 
    });
  }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .lean();
    
    const formattedOrders = orders.map(order => ({
      ...order,
      customerInfo: {
        name: order.userId?.name || 'N/A',
        email: order.userId?.email || 'N/A',
        phone: order.userId?.phone || 'N/A'
      }
    }));
    
    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('❌ Admin orders error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch admin orders' 
    });
  }
});

app.put('/api/admin/orders/:orderId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'quality-check', 'out-for-delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const updateData = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateData,
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }
    
    await emailService.sendOrderStatusUpdate(order.userId, order, status);
    
    res.json({ 
      success: true, 
      order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update order status' 
    });
  }
});

// User profile routes
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Rype Backend Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`👤 Test Admin: admin@rype.com / admin123`);
  console.log(`👥 Test Customer: customer@rype.com / customer123`);
});