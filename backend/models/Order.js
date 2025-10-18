const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    },
    name: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1 
    },
    image: { 
      type: String 
    }
  }],
  total: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'preparing', 'quality-check', 'out-for-delivery', 'delivered', 'cancelled'] 
  },
  address: { 
    type: String, 
    required: true 
  },
  customerInfo: {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String 
    }
  },
  paymentMethod: { 
    type: String, 
    default: 'card',
    enum: ['card', 'upi', 'cod'] 
  },
  estimatedDelivery: { 
    type: Date 
  },
  deliveredAt: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);