import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/articles", label: "Catalogue", icon: BookOpen },
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">ADMINISTRATION</h2>
          <p className="text-sm text-gray-400 mt-1">
            {user?.first_name} {user?.last_name}
          </p>
        </div>

        <nav className="flex-1 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-6 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-6 py-4 border-t border-gray-800 text-gray-300 hover:bg-gray-800 transition"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 bg-[#F6F4EE]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
