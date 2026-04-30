import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Home } from "@/pages/Home";
import { Catalogue } from "@/pages/Catalogue";
import { About } from "@/pages/About";
import { ProductDetail } from "@/pages/ProductDetail";
import { AdminLogin } from "@/pages/admin/Login";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminArticles } from "@/pages/admin/Articles";
import { AdminOrders } from "@/pages/admin/Orders";
import { AdminSettings } from "@/pages/admin/Settings";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { ScrollToTop } from "./components/ScrollToTop";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      {/* ScrollToTop must be inside Router to access routing context */}
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/about" element={<About />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
