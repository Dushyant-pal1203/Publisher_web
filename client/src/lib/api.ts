import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
        toast.error("Session expired. Please login again.");
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  me: () => api.get("/auth/me"),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  loginWithOTP: (data: { phone_number: string; otp: string }) =>
    api.post("/auth/login-otp", data),
  sendOTP: (phone_number: string) =>
    api.post("/auth/send-otp", { phone_number }),
  logout: () => api.post("/auth/logout"),
  setup: (data: any) => api.post("/auth/setup", data),
};

// Article API
export const articleAPI = {
  getAll: () => api.get("/articles"),
  getPublic: () => api.get("/articles/public"),
  getById: (id: number) => api.get(`/articles/${id}`),
  create: (data: any) => api.post("/articles", data),
  update: (id: number, data: any) => api.put(`/articles/${id}`, data),
  delete: (id: number) => api.delete(`/articles/${id}`),
};

// Order API
export const orderAPI = {
  getAll: () => api.get("/orders"),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post("/orders", data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getQuickStats: () => api.get("/dashboard/quick-stats"),
};

// Settings API
export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data: any) => api.put("/settings", data),
  getPublic: () => api.get("/settings/public"),
};

export default api;
