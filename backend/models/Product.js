const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  vitaminC: String,
  sugar: String,
  protein: String,
  carbs: String
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  image: {
    type: String,
    default: "🍊"
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  ingredients: [String],
  size: {
    type: String,
    default: "500ml"
  },
  nutrition: nutritionSchema,
  category: {
    type: String,
    enum: [
      'citrus', 'fruit', 'superfood', 'vegetable', 'melon', 'berry', 
      'tropical', 'detox', 'immunity', 'hydration', 'digestive', 
      'wellness', 'fitness', 'beauty', 'ayurvedic', 'energy', 
      'weightloss', 'kids', 'exotic', 'classic', 'premium', 'fusion', 
      'boost', 'seasonal'
    ],
    default: 'fruit'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  popularity: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);