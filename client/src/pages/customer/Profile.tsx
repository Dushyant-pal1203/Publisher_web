// client/src/pages/customer/Profile.tsx
import { useState } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/common/Button";
import { User, Mail, Phone, Lock, Save, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

export const CustomerProfile = () => {
  const { user, updateProfile, changePassword } = useCustomerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const success = await changePassword(
      passwordData.current_password,
      passwordData.new_password,
    );
    if (success) {
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-blue-100 text-sm">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "recently"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing
                        ? "border-gray-300"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing
                        ? "border-gray-300"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Change Password
            </h3>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      current_password: "",
                      new_password: "",
                      confirm_password: "",
                    });
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button onClick={handleChangePassword}>Update Password</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
