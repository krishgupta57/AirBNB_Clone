import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration/invalidity
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Clearing stale session.");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      
      // Redirect to login if not already there, and if the user was supposedly logged in
      if (!window.location.pathname.includes('/login')) {
         toast.error("Session expired. Please login again.");
         setTimeout(() => {
           window.location.href = '/login';
         }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

export default API;