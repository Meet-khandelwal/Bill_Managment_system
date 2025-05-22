import axios from "axios";

const API = axios.create({
  baseURL: https://bill-managment-system-bakend.onrender.com/api || "http://localhost:5000/api",
});

// Add token to headers for every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

