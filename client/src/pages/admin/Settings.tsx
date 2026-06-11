import { useEffect, useState, useRef } from "react";
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
  payment_instructions: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  qr_code_url: string;
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
    payment_instructions: "",
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    qr_code_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();

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
        payment_instructions: settingsData.payment_instructions || "",
        account_holder_name: settingsData.account_holder_name || "",
        bank_name: settingsData.bank_name || "",
        account_number: settingsData.account_number || "",
        ifsc_code: settingsData.ifsc_code || "",
        qr_code_url: settingsData.qr_code_url || "",
      });

      if (settingsData.qr_code_url) {
        setQrPreview(settingsData.qr_code_url);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let formData: SettingsData | FormData;

      if (qrFile) {
        formData = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== "qr_code_url") {
            (formData as FormData).append(key, value.toString());
          }
        });
        (formData as FormData).append("qr_code", qrFile);
      } else {
        formData = settings;
      }

      const response = await settingsAPI.update(formData);
      toast.success("Settings saved successfully!");

      if (qrFile) {
        setQrFile(null);
        if (response.data.settings?.qr_code_url) {
          setQrPreview(response.data.settings.qr_code_url);
        }
      }

      await fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleQRCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const previewUrl = URL.createObjectURL(file);
      setQrPreview(previewUrl);
    }
  };

  const handleDeleteQRCode = async () => {
    if (!confirm("Are you sure you want to delete the QR code?")) return;

    try {
      await settingsAPI.deleteQRCode();
      toast.success("QR code deleted successfully");
      setQrFile(null);
      setQrPreview("");
      setSettings((prev) => ({ ...prev, qr_code_url: "" }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete QR code");
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

          {/* UPI Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              UPI Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                <p className="text-xs text-gray-500 mt-1">
                  Enter your UPI ID for direct payments (e.g., bookstore@icici)
                </p>
              </div>
            </div>
          </div>

          {/* Bank Transfer Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Bank Transfer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={settings.account_holder_name}
                  onChange={(e) =>
                    handleChange("account_holder_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={settings.bank_name}
                  onChange={(e) => handleChange("bank_name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={settings.account_number}
                  onChange={(e) =>
                    handleChange("account_number", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={settings.ifsc_code}
                  onChange={(e) => handleChange("ifsc_code", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">QR Code</h3>
            <div className="space-y-4">
              {qrPreview && (
                <div className="flex items-start space-x-4">
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img
                      src={
                        qrPreview.startsWith("http")
                          ? qrPreview
                          : `${import.meta.env.VITE_API_URL || ""}${qrPreview}`
                      }
                      alt="Payment QR Code"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteQRCode}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    Remove QR Code
                  </Button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload QR Code
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQRCodeUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a QR code for UPI payments (JPEG, PNG, GIF, WEBP - Max
                  5MB)
                </p>
              </div>
            </div>
          </div>

          <div>
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
