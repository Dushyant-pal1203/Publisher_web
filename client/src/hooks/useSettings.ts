import { useEffect, useState } from "react";
import { settingsAPI } from "@/lib/api";

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

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    publisher_name: "Publishing House",
    tagline: "Books, journals and stories that matter",
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getPublic();

      let settingsData;
      if (response.data.settings) {
        settingsData = response.data.settings;
      } else {
        settingsData = response.data;
      }

      setSettings({
        publisher_name: settingsData.publisher_name || "Publishing House",
        tagline:
          settingsData.tagline || "Books, journals and stories that matter",
        about: settingsData.about || "",
        whatsapp_number:
          settingsData.whatsapp_number || settingsData.phone_number || "",
        contact_email: settingsData.contact_email || settingsData.email || "",
        contact_address:
          settingsData.contact_address || settingsData.address || "",
        currency: settingsData.currency || "INR",
        upi_id: settingsData.upi_id || "",
        bank_details: settingsData.bank_details || "",
        payment_instructions: settingsData.payment_instructions || "",
      });
    } catch (error) {
      // Optional: keep this if you want basic error visibility
      //   console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
};
