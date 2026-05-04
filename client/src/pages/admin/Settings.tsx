import { useEffect, useState } from "react";
import { settingsAPI } from "@/lib/api";
import { Button } from "@/components/common/Button";
import toast from "react-hot-toast";

interface SettingsData {
  id?: number;
  publisher_name: string;
  tagline: string;
  about: string;
  whatsapp_number: string;
  contact_email: string;
  contact_address: string;
  currency: string;
  upi_id: string;
  bank_details: string;
  payment_instructions: string;
  created_at?: string;
  updated_at?: string;
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    publisher_name: "",
    tagline: "",
    about: "",
    whatsapp_number: "",
    contact_email: "",
    contact_address: "",
    currency: "INR",
    upi_id: "",
    bank_details: "",
    payment_instructions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      // console.log("Settings response:", response.data);

      // Handle different response structures
      let settingsData;
      if (response.data.settings) {
        settingsData = response.data.settings;
      } else if (response.data.data) {
        settingsData = response.data.data;
      } else {
        settingsData = response.data;
      }

      setSettings({
        publisher_name: settingsData.publisher_name || "",
        tagline: settingsData.tagline || "",
        about: settingsData.about || "",
        whatsapp_number: settingsData.whatsapp_number || "",
        contact_email: settingsData.contact_email || "",
        contact_address: settingsData.contact_address || "",
        currency: settingsData.currency || "INR",
        upi_id: settingsData.upi_id || "",
        bank_details: settingsData.bank_details || "",
        payment_instructions: settingsData.payment_instructions || "",
      });
    } catch (error: any) {
      // console.error("Failed to load settings:", error);
      toast.error(error.response?.data?.error || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await settingsAPI.update(settings);
      // console.log("Update response:", response.data);
      toast.success("Settings saved successfully!");

      // Refresh settings after update
      await fetchSettings();
    } catch (error: any) {
      // console.error("Failed to save settings:", error);
      toast.error(error.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Publisher Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            Publisher Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publisher Name
              </label>
              <input
                type="text"
                value={settings.publisher_name}
                onChange={(e) => handleChange("publisher_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter publisher name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your tagline"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) =>
                  handleChange("whatsapp_number", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Address
            </label>
            <textarea
              value={settings.contact_address}
              onChange={(e) => handleChange("contact_address", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Your complete address"
            />
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            Payment Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID
              </label>
              <input
                type="text"
                value={settings.upi_id}
                onChange={(e) => handleChange("upi_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="example@upi"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Details
            </label>
            <textarea
              value={settings.bank_details}
              onChange={(e) => handleChange("bank_details", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Bank Name, Account Number, IFSC Code..."
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Instructions
            </label>
            <textarea
              value={settings.payment_instructions}
              onChange={(e) =>
                handleChange("payment_instructions", e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Instructions for customers about payment..."
            />
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            About
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About Us
            </label>
            <textarea
              value={settings.about}
              onChange={(e) => handleChange("about", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tell your story..."
            />
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} size="lg">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
