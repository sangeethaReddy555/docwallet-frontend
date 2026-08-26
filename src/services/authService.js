import apiClient from "./apiClient";

// Every function here returns the "data" object from the API response,
// or throws an Error with a human-readable .message (already unwrapped
// by apiClient) — pages never need to know about { success, message, data }.

export const authService = {
  register: (payload) => apiClient.post("/auth/register", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.get("/auth/me"),
  forgotPassword: (payload) => apiClient.post("/auth/forgot-password", payload),
  verifyOtp: (payload) => apiClient.post("/auth/verify-otp", payload),
  resetPassword: (payload) => apiClient.post("/auth/reset-password", payload),
};

