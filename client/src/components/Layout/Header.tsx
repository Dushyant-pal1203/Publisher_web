import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/images/ph-logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full shadow hover:shadow-lg transition"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Publishing House
              </h1>
              <p className="text-xs text-gray-500">
                Books, journals and stories that matter
              </p>
            </div>
          </Link>

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
            <button
              onClick={() => navigate("/admin/login")}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <User className="h-4 w-4" />
              <span>Admin</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
