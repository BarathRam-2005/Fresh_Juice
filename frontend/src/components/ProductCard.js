import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  // Safe data access with comprehensive fallbacks
  const nutrition = product?.nutrition || {
    calories: 100,
    vitaminC: "100%",
    sugar: "20g",
    protein: "1g",
    carbs: "25g"
  };
  
  const ingredients = product?.ingredients || ["Fresh Fruits"];
  const size = product?.size || "500ml";
  const image = product?.image || "🍊";
  const description = product?.description || "Fresh and delicious juice";
  const inStock = product?.inStock !== false; // Default to true if undefined

  // If product is undefined or null, show loading state
  if (!product) {
    return (
      <div className="product-card loading">
        <div className="product-image">🍊</div>
        <div className="product-info">
          <h3>Loading...</h3>
          <p className="description">Product information is loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
      <div className="product-image">{image}</div>
      
      <div className="product-info">
        <h3>{product.name || "Fresh Juice"}</h3>
        <p className="description">{description}</p>
        
        <div className="nutrition">
          <span title="Calories">⚡ {nutrition.calories || 100} cal</span>
          <span title="Vitamin C">🍋 {nutrition.vitaminC || "100%"} Vit C</span>
          {nutrition.sugar && <span title="Sugar">🍬 {nutrition.sugar}</span>}
          {nutrition.protein && <span title="Protein">💪 {nutrition.protein}</span>}
        </div>
        
        <div className="ingredients">
          <strong>Ingredients:</strong> {Array.isArray(ingredients) ? ingredients.join(', ') : "Fresh Fruits"}
        </div>
        
        <div className="size">{size}</div>
        
        <div className="price-add">
          <span className="price">₹{product.price || "199"}</span>
          {inStock ? (
            <button 
              className="add-to-cart"
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to Cart
            </button>
          ) : (
            <button className="out-of-stock-btn" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;