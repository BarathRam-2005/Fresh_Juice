export const config = {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key_here'
  };