// client/src/hooks/useCustomerAuth.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { customerAuthAPI } from "@/lib/customerApi";

export interface CustomerUser {
  id: string;
  email?: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  created_at?: string;
}

export const useCustomerAuth = () => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await customerAuthAPI.me();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    first_name?: string,
    last_name?: string,
    phone_number?: string,
  ) => {
    try {
      const response = await customerAuthAPI.signup({
        email,
        password,
        first_name,
        last_name,
        phone_number,
      });
      setUser(response.data.user);
      toast.success("Account created successfully!");
      navigate("/customer/dashboard");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Signup failed");
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await customerAuthAPI.login({ email, password });
      setUser(response.data.user);
      toast.success("Login successful!");
      navigate("/customer/dashboard");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const loginWithOTP = async (phone_number: string, otp: string) => {
    try {
      const response = await customerAuthAPI.loginWithOTP({
        phone_number,
        otp,
      });
      setUser(response.data.user);
      toast.success("Login successful!");
      navigate("/customer/dashboard");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const sendOTP = async (phone_number: string) => {
    try {
      await customerAuthAPI.sendOTP(phone_number);
      toast.success("OTP sent successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
      return false;
    }
  };

  const updateProfile = async (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  }) => {
    try {
      const response = await customerAuthAPI.updateProfile(data);
      setUser(response.data.user);
      toast.success("Profile updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
      return false;
    }
  };

  const changePassword = async (
    current_password: string,
    new_password: string,
  ) => {
    try {
      await customerAuthAPI.changePassword({ current_password, new_password });
      toast.success("Password changed successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password");
      return false;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const response = await customerAuthAPI.uploadAvatar(file);
      setUser(response.data.user);
      toast.success("Profile picture updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload avatar");
      return false;
    }
  };

  const deleteAvatar = async () => {
    try {
      const response = await customerAuthAPI.deleteAvatar();
      setUser(response.data.user);
      toast.success("Profile picture removed successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete avatar");
      return false;
    }
  };

  const logout = async () => {
    try {
      await customerAuthAPI.logout();
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return {
    user,
    loading,
    signup,
    login,
    loginWithOTP,
    sendOTP,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    logout,
  };
};
