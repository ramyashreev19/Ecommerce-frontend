import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const Chatbot = () => {
  // State variables
  const [isRegistering, setIsRegistering] = useState(false);  // Flag for registration mode
  const [messages, setMessages] = useState([]);  // Store chat messages
  const [input, setInput] = useState('');  // Store user input message
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Flag for user authentication status
  const [username, setUsername] = useState('');  // Store user input username
  const [password, setPassword] = useState('');  // Store user input password
  const [loading, setLoading] = useState(false);  // Flag to indicate if the system is processing
  const [error, setError] = useState(null);  // Store error messages
  const [userId, setUserId] = useState(null);  // Store authenticated user ID
  const messagesEndRef = useRef(null);  // Reference to scroll to the bottom of chat

  // Function to scroll to the bottom of chat window after new message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history once authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadChatHistory();
    }
  }, [isAuthenticated, userId]);

  // Function to load chat history from the backend
  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await api.getChatHistory(userId);  // API call to get chat history
      setMessages(history.map(msg => ({
        sender: msg.type,
        text: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      })));
    } catch (err) {
      setError('Failed to load chat history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user registration
  const handleRegister = async (e) => {
    e.preventDefault();  // Prevent form default submit action
    setLoading(true);
    setError(null);

    try {
      const response = await api.register(username, password);  // API call to register user
      if (response.success) {
        setIsRegistering(false);  // Switch to login mode
        setError('Registration successful! Please login.');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent form default submit action
    setLoading(true);
    setError(null);

    try {
      const response = await api.login(username, password);  // API call to login user
      if (response.success) {
        setIsAuthenticated(true);  // Mark user as authenticated
        setUserId(response.user_id);  // Set user ID
        handleBotResponse("Welcome! How can I help you today? You can ask about our products, search for items, or get help with shopping.");
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    setIsAuthenticated(false);  // Set authenticated flag to false
    setMessages([]);  // Clear chat history
    setUsername('');  // Clear input fields
    setPassword('');
    setUserId(null);
    setError(null);  // Clear any error messages
  };

  // Function to handle bot responses and add them to chat
  const handleBotResponse = async (text) => {
    const botMessage = {
      sender: 'bot',
      text,
      timestamp: new Date().toLocaleTimeString()  // Add timestamp for the bot's message
    };
    setMessages(prev => [...prev, botMessage]);  // Add bot message to chat

    // Save bot message to backend
    if (userId) {
      try {
        await api.saveChatMessage(userId, text, 'bot');  // API call to save bot message
      } catch (err) {
        console.error('Failed to save bot message:', err);
      }
    }
  };

  // Function to process user messages and return bot response
  const processUserMessage = async (userInput) => {
    const lowercaseInput = userInput.toLowerCase();  // Normalize input to lowercase

    try {
      // Search for products
      if (lowercaseInput.includes('search') || lowercaseInput.includes('find')) {
        const searchTerms = lowercaseInput.replace('search', '').replace('find', '').trim();  // Remove 'search' and 'find' keywords

        // Call API to search products
        const products = await api.searchProducts(searchTerms);

        if (products.length > 0) {
          return `I found these products:\n${products.map(product => 
            `- ${product.name}: $${product.price} (${product.stock} in stock)`  // Format product results
          ).join('\n')}`;
        } else {
          return "I couldn't find any products matching your search. Can you try different keywords?";
        }
      }

      // Help with shopping
      if (lowercaseInput.includes('help') || lowercaseInput.includes('how to')) {
        return "I can help you with:\n" +
          "- Searching products (try 'search electronics')\n" +
          "- Browse categories (e.g., 'show smartphones')\n" +
          "- Find products in price range (e.g., '10 to 50 dollars')\n" +
          "- Get product recommendations\n" +
          "- Checking prices and stock\n" +
          "What would you like to know more about?";
      }

      // Default response
      return "I'm here to help you shop! You can:\n" +
        "- Search for products\n" +
        "- Browse by category\n" +
        "- Find products in a specific price range\n" +
        "- Get product recommendations\n" +
        "Type 'help' for more information";
    } catch (err) {
      console.error('Error processing message:', err);
      return "I'm having trouble processing your request. Please try again later.";
    }
  };

  // Function to handle sending the user message
  const handleSendMessage = async (e) => {
    e.preventDefault();  // Prevent form default submit action
    if (input.trim()) {
      const userMessage = {
        sender: 'user',
        text: input,
        timestamp: new Date().toLocaleTimeString()  // Add timestamp to user message
      };

      setMessages(prev => [...prev, userMessage]);  // Add user message to chat

      // Save user message to backend
      try {
        await api.saveChatMessage(userId, input, 'user');  // API call to save user message
      } catch (err) {
        console.error('Failed to save user message:', err);
      }

      setInput('');  // Clear the input field

      // Process the message and get bot response
      const botResponse = await processUserMessage(input);
      handleBotResponse(botResponse);  // Handle bot response
    }
  };

  // If the user is not authenticated, show login or registration form
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          </div>
          <div className="p-6 space-y-6">
            {error && <div className={error}>{error}</div>}
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
              </button>
            </form>
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setUsername('');
                  setPassword('');
                }}
              >
                Switch to {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If the user is authenticated, show chat interface
  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="header">
          <h2>E-commerce Sales Chatbot</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div className="messages">
          <div className="h-[500px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <span>
                  {msg.text}
                  <span className="timestamp">{msg.timestamp}</span>
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
