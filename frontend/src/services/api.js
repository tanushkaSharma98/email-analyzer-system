import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const emailAPI = {
  // Health
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  // Get config
  getConfig: async () => {
    const response = await api.get('/emails/config');
    return response.data;
  },
  // Get latest email
  getLatestEmail: async () => {
    const response = await api.get('/emails/latest');
    return response.data;
  },

  // Get all emails
  getAllEmails: async (limit = 50) => {
    const response = await api.get(`/emails/all?limit=${limit}`);
    return response.data;
  },

  // Get email by ID
  getEmailById: async (id) => {
    const response = await api.get(`/emails/${id}`);
    return response.data;
  },

  // Get emails by ESP
  getEmailsByESP: async (esp) => {
    const response = await api.get(`/emails/esp/${esp}`);
    return response.data;
  },

  // Get email statistics
  getEmailStats: async () => {
    const response = await api.get('/emails/stats');
    return response.data;
  },

  // Trigger rescan
  triggerRescan: async () => {
    const response = await api.get('/emails/rescan');
    return response.data;
  },

  // Delete email
  deleteEmail: async (id) => {
    const response = await api.delete(`/emails/${id}`);
    return response.data;
  },
};

export default api;
