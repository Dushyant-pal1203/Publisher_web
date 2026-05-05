import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export const Footer = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="animate-pulse">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4 gap-2">
              <a href="/" className="flex">
                <img
                  src="/images/ph-logo.png"
                  alt="Logo"
                  className="h-12 w-12 rounded-full shadow hover:shadow-lg hover:shadow-cyan-600 transition"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/48";
                  }}
                />
              </a>
              <h3 className="text-white font-semibold">About Us</h3>
            </div>
            <p className="text-sm">
              {settings.about ||
                "We publish quality academic journals, literary works, and cultural publications that inspire and educate readers worldwide."}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Submit Manuscript
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Become a Reviewer
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Advertising
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              {/* Email */}
              {settings.contact_email && settings.contact_email !== "" && (
                <li>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-white transition flex items-center space-x-2 gap-2"
                  >
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    {settings.contact_email}
                  </a>
                </li>
              )}

              {/* Phone/WhatsApp Number */}
              {settings.whatsapp_number && settings.whatsapp_number !== "" && (
                <li>
                  <a
                    href={`tel:${settings.whatsapp_number}`}
                    className="hover:text-white transition flex items-center space-x-2 gap-2"
                  >
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    {settings.whatsapp_number}
                  </a>
                </li>
              )}

              {/* Address */}
              {settings.contact_address && settings.contact_address !== "" && (
                <li>
                  <div className="flex items-center space-x-2 gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {settings.contact_address}
                  </div>
                </li>
              )}

              {/* Default contact info */}
              {(!settings.whatsapp_number || settings.whatsapp_number === "") &&
                (!settings.contact_email || settings.contact_email === "") &&
                (!settings.contact_address ||
                  settings.contact_address === "") && (
                  <>
                    <li className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>+91 9310004022</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>contact@publishinghouse.com</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>New Delhi, India</span>
                    </li>
                  </>
                )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-white transition" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-white transition" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-white transition" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row mt-5 justify-between items-center gap-4 border-t border-white/10 py-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <div className="transition-colors text-white">
            © 2024 {settings.publisher_name}. All rights reserved.
          </div>
          <div className="transition-colors text-white">
            Designed & Built with Passion By Dushyant Pal
          </div>
        </div>
      </div>
    </footer>
  );
};
