// src/services/auth.js
import API from "./api";

export const loginUser = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return response.data;
};

export const signupUser = async (userData) => {
  const response = await API.post("/auth/signup", userData);
  return response.data;
};
