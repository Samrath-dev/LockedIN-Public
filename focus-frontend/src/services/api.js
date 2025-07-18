// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,      // e.g. http://localhost:8080
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;