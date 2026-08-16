import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token and Session ID if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dhakshu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const sessionId = localStorage.getItem('dhakshu_session_id');
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract standard ApiResponse & Normalize Customer Errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      // Network error or backend offline
      return Promise.reject(new Error('Unable to connect to Dhakshu Bakes server. Please check your internet connection.'));
    }

    const status = error.response.status;
    const backendMessage = error.response.data?.message;

    let friendlyMessage = 'An unexpected issue occurred. Please try again.';

    switch (status) {
      case 400:
        friendlyMessage = backendMessage || 'Please review your inputs and try again.';
        break;
      case 401:
        friendlyMessage = backendMessage || 'Your session has expired. Please sign in again.';
        break;
      case 403:
        friendlyMessage = backendMessage || 'You do not have permission to perform this action.';
        break;
      case 404:
        friendlyMessage = backendMessage || 'The requested item or resource could not be found.';
        break;
      case 409:
        friendlyMessage = backendMessage || 'Item availability or inventory has changed. Please refresh your cart.';
        break;
      case 429:
        friendlyMessage = backendMessage || 'Too many attempts. Please wait a minute before trying again.';
        break;
      case 500:
      default:
        friendlyMessage = 'Our bakery server encountered a hiccup. Please try again shortly.';
        break;
    }

    const customError = new Error(friendlyMessage);
    customError.status = status;
    customError.originalMessage = backendMessage;
    return Promise.reject(customError);
  }
);

export default api;
