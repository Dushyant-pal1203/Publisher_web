// client/src/lib/customerApi.ts
import axios from "axios";
import toast from "react-hot-toast";

const customerApi = axios.create({
  baseURL: "/api/customer",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 for the me endpoint - it's expected when not logged in
    const isMeEndpoint = error.config?.url === "/me";

    if (error.response?.status === 401 && !isMeEndpoint) {
      if (
        !window.location.pathname.includes("/customer/login") &&
        !window.location.pathname.includes("/customer/signup")
      ) {
        window.location.href = "/customer/login";
        toast.error("Session expired. Please login again.");
      }
    }
    return Promise.reject(error);
  },
);

export const customerAuthAPI = {
  me: () => customerApi.get("/me"),
  signup: (data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }) => customerApi.post("/signup", data),
  login: (data: { email: string; password: string }) =>
    customerApi.post("/login", data),
  loginWithOTP: (data: { phone_number: string; otp: string }) =>
    customerApi.post("/login-otp", data),
  sendOTP: (phone_number: string) =>
    customerApi.post("/send-otp", { phone_number }),
  logout: () => customerApi.post("/logout"),
  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  }) => customerApi.put("/profile", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    customerApi.put("/change-password", data),
};

export const customerOrderAPI = {
  getMyOrders: () => customerApi.get("/my-orders"),
  getOrderDetails: (id: number) => customerApi.get(`/orders/${id}`),
  trackOrder: (id: number) => customerApi.get(`/orders/${id}/track`),
};

export default customerApi;
