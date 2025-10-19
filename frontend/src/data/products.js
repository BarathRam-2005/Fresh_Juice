export const products = [
    {
      id: 1,
      name: "Classic Fresh Orange Juice",
      price: 4.99,
      image: "🍊",
      description: "Freshly squeezed pure orange juice, no additives",
      ingredients: ["Fresh Oranges"],
      size: "500ml",
      nutrition: {
        calories: 110,
        vitaminC: "120%",
        sugar: "22g"
      },
      inStock: true
    },
    {
      id: 2,
      name: "Premium Blood Orange Juice",
      price: 6.99,
      image: "🩸",
      description: "Rare blood oranges with rich flavor and deep color",
      ingredients: ["Blood Oranges"],
      size: "500ml",
      nutrition: {
        calories: 120,
        vitaminC: "150%",
        sugar: "25g"
      },
      inStock: true
    },
    {
      id: 3,
      name: "Orange Carrot Fusion",
      price: 5.99,
      image: "🥕",
      description: "Perfect blend of sweet oranges and fresh carrots",
      ingredients: ["Oranges", "Carrots", "Ginger"],
      size: "500ml",
      nutrition: {
        calories: 95,
        vitaminC: "100%",
        sugar: "18g"
      },
      inStock: true
    },
    {
      id: 4,
      name: "Citrus Boost",
      price: 7.49,
      image: "💪",
      description: "Orange juice with lemon and grapefruit for extra zing",
      ingredients: ["Oranges", "Lemons", "Grapefruit"],
      size: "500ml",
      nutrition: {
        calories: 105,
        vitaminC: "200%",
        sugar: "20g"
      },
      inStock: false
    }
  ];
  
  export const orderStages = [
    { id: 1, name: "Order Placed", description: "We've received your order", completed: true },
    { id: 2, name: "Preparing", description: "Squeezing fresh oranges", completed: false },
    { id: 3, name: "Quality Check", description: "Ensuring perfect taste", completed: false },
    { id: 4, name: "Out for Delivery", description: "On its way to you!", completed: false },
    { id: 5, name: "Delivered", description: "Enjoy your fresh juice!", completed: false }
  ];