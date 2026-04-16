import axios from 'axios';
const BASE_URL = 'https://g8api.bskpay.com.br';

export const getDeviceId = () => {
  if (typeof window === 'undefined') return 'IB-WEB-PLATFORM';
  let dId = localStorage.getItem('deviceId');
  if (!dId) {
    // Generate a consistent ID for the browser if not present
    dId = `IB-WEB-${crypto.randomUUID()}`;
    localStorage.setItem('deviceId', dId);
  }
  return dId;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to automatically attach tokens if they exist
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userToken = localStorage.getItem('userToken');
      

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (userToken) {
        config.headers.userToken = userToken;
      }

    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling (e.g., 401 redirects)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized detected. Redirect suppressed for debugging.");
      /*
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userToken');
        window.location.href = '/';
      }
      */
    }
    return Promise.reject(error);
  }
);

export default api;
