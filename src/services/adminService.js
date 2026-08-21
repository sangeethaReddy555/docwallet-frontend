import apiClient from "./apiClient";

export const adminService = {
  getPendingUsers: () => apiClient.get("/admin/pending-users"),
  reviewUser: (userId, action) => apiClient.post("/admin/approve-user", { userId, action }),
  getUserStats: () => apiClient.get("/admin/stats"),
};