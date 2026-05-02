// client/src/components/Layout/Header.tsx
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User, Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user: customerUser, logout: customerLogout } = useCustomerAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleCustomerLogout = async () => {
    await customerLogout();
    closeMenu();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <img
              src="/images/ph-logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full shadow hover:shadow-lg transition"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/48";
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Publishing House
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Books, journals and stories that matter
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Home
            </Link>
            <Link
              to="/catalogue"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Catalogue
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              About
            </Link>

            {/* Customer Account Dropdown */}
            {customerUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link
                    to="/customer/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/customer/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/customer/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleCustomerLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => navigate("/customer/login")}
                className="gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}

            {/* Admin Button */}
            <Button
              onClick={() => navigate("/admin/login")}
              variant="secondary"
              className="gap-2 border border-gray-300"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col space-y-4 pb-4">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Home
            </Link>
            <Link
              to="/catalogue"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Catalogue
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              About
            </Link>

            {customerUser ? (
              <>
                <Link
                  to="/customer/dashboard"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-blue-600 transition py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/orders"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-blue-600 transition py-2"
                >
                  My Orders
                </Link>
                <Link
                  to="/customer/profile"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-blue-600 transition py-2"
                >
                  Profile
                </Link>
                <button
                  onClick={handleCustomerLogout}
                  className="text-left text-red-600 hover:text-red-700 transition py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Button
                onClick={() => {
                  closeMenu();
                  navigate("/customer/login");
                }}
                className="gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}

            <Button
              onClick={() => {
                closeMenu();
                navigate("/admin/login");
              }}
              variant="secondary"
              className="gap-2 border border-gray-300 rounded-lg w-full"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
