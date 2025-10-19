import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import './Menu.css';

const Menu = ({ products = [], onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 400]); // Updated for Indian prices
  const [localProducts, setLocalProducts] = useState([]);

  // Ensure products is always an array
  useEffect(() => {
    if (Array.isArray(products)) {
      setLocalProducts(products);
    } else {
      setLocalProducts([]);
    }
  }, [products]);

  const categories = [
    { value: 'all', label: 'All Juices', emoji: '🍹' },
    { value: 'citrus', label: 'Citrus', emoji: '🍊' },
    { value: 'fruit', label: 'Fruits', emoji: '🍎' },
    { value: 'superfood', label: 'Superfood', emoji: '❤️' },
    { value: 'vegetable', label: 'Vegetable', emoji: '🥕' },
    { value: 'melon', label: 'Melon', emoji: '🍉' },
    { value: 'berry', label: 'Berry', emoji: '🫐' },
    { value: 'tropical', label: 'Tropical', emoji: '🍍' },
    { value: 'detox', label: 'Detox', emoji: '🍃' },
    { value: 'immunity', label: 'Immunity', emoji: '💪' },
    { value: 'hydration', label: 'Hydration', emoji: '🥥' },
    { value: 'digestive', label: 'Digestive', emoji: '🔄' },
    { value: 'wellness', label: 'Wellness', emoji: '🧠' },
    { value: 'fitness', label: 'Fitness', emoji: '🏋️' },
    { value: 'beauty', label: 'Beauty', emoji: '✨' },
    { value: 'ayurvedic', label: 'Ayurvedic', emoji: '🌱' },
    { value: 'energy', label: 'Energy', emoji: '⚡' },
    { value: 'weightloss', label: 'Weight Loss', emoji: '⚖️' },
    { value: 'kids', label: 'Kids', emoji: '👶' },
    { value: 'exotic', label: 'Exotic', emoji: '🐉' }
  ];

  const filteredAndSortedProducts = useMemo(() => {
    // Ensure we're working with an array
    if (!Array.isArray(localProducts)) {
      return [];
    }

    let filtered = localProducts.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
    }

    return filtered;
  }, [localProducts, searchTerm, selectedCategory, sortBy, priceRange]);

  const featuredProducts = useMemo(() => {
    return Array.isArray(localProducts) 
      ? localProducts.filter(product => product.featured)
      : [];
  }, [localProducts]);

  // Loading state
  if (!Array.isArray(products)) {
    return (
      <div className="menu-page">
        <div className="loading-state">
          <div className="loading-icon">🍊</div>
          <h3>Loading juices...</h3>
          <p>Preparing our fresh menu for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="page-header">
        <h1>Our Juice Menu</h1>
        <p>Freshly squeezed, delivered to your door in minutes</p>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search juices... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="popularity">🔥 Popular</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💰 Price: High to Low</option>
              <option value="name">🔤 Name</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="400"
                step="10"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
              />
              <input
                type="range"
                min="0"
                max="400"
                step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && searchTerm === '' && selectedCategory === 'all' && (
        <section className="featured-section">
          <h2>⭐ Featured Juices</h2>
          <div className="products-grid featured-grid">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product._id || product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                featured={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="all-products-section">
        <div className="section-header">
          <h2>
            {selectedCategory === 'all' ? 'All Juices' : 
             categories.find(c => c.value === selectedCategory)?.label}
            <span className="product-count"> ({filteredAndSortedProducts.length})</span>
          </h2>
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No juices found</h3>
            <p>Try adjusting your search or filters</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange([0, 400]);
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredAndSortedProducts.map(product => (
              <ProductCard 
                key={product._id || product.id} 
                product={product} 
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Menu;