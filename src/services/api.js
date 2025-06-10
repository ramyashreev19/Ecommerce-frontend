// src/services/api.js

// Base API URL for all requests
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  // Function to register a new user
  async register(username, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',  // HTTP POST method for registration
      headers: {
        'Content-Type': 'application/json',  // Content type is JSON
      },
      body: JSON.stringify({ username, password }),  // Sending the username and password in the request body
    });
    return response.json();  // Parse and return the JSON response
  },

  // Function to log in a user
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',  // HTTP POST method for login
      headers: {
        'Content-Type': 'application/json',  // Content type is JSON
      },
      body: JSON.stringify({ username, password }),  // Sending username and password in request body
    });
    return response.json();  // Parse and return the JSON response
  },

  // Function to search for products based on a query and category
  async searchProducts(query, category) {
    const params = new URLSearchParams();
    if (query) params.append('search', query);  // Append search query if provided
    if (category) params.append('category', category);  // Append category if provided
    
    const response = await fetch(`${API_URL}/products?${params}`);  // Fetch products with query params
    return response.json();  // Parse and return the JSON response
  },

  // Function to get products filtered by a specific category
  async getProductsByCategory(category) {
    const response = await fetch(`${API_URL}/products/category/${category}`);  // Fetch products by category
    return response.json();  // Parse and return the JSON response
  },

  // Function to search for products within a specified price range
  async searchProductsByPriceRange(minPrice, maxPrice) {
    const params = new URLSearchParams({
      min_price: minPrice,  // Minimum price for the search filter
      max_price: maxPrice   // Maximum price for the search filter
    });
    
    const response = await fetch(`${API_URL}/products/price-range?${params}`);  // Fetch products by price range
    return response.json();  // Parse and return the JSON response
  },

  // Function to get recommended products (could be based on user's preferences or past behavior)
  async getRecommendedProducts() {
    const response = await fetch(`${API_URL}/products/recommended`);  // Fetch recommended products
    return response.json();  // Parse and return the JSON response
  },

  // Function to save a new chat message for a user
  async saveChatMessage(userId, content, type) {
    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',  // HTTP POST method for saving a chat message
      headers: {
        'Content-Type': 'application/json',  // Content type is JSON
      },
      body: JSON.stringify({ user_id: userId, content, type }),  // Sending the user ID, message content, and message type in the request body
    });
    return response.json();  // Parse and return the JSON response
  },

  // Function to get the chat history of a user
  async getChatHistory(userId) {
    const response = await fetch(`${API_URL}/chat/history?user_id=${userId}`);  // Fetch chat history for the given user ID
    return response.json();  // Parse and return the JSON response
  },
};
