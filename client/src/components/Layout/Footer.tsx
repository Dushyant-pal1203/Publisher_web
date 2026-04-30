import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              We publish quality academic journals, literary works, and cultural
              publications that inspire and educate readers worldwide.
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
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@publishinghouse.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>New Delhi, India</span>
              </li>
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
            © 2024 Publishing House. All rights reserved.
          </div>
          <div className="transition-colors text-white">
            {" "}
            Designed & Built with Passion By Dushyant Pal
          </div>
        </div>
      </div>
    </footer>
  );
};
