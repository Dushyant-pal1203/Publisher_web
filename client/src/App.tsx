// client/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Home } from "@/pages/Home";
import { Catalogue } from "@/pages/Catalogue";
import { About } from "@/pages/About";
import { ProductDetail } from "@/pages/products/ProductDetail";
import { AdminLogin } from "@/pages/admin/Login";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminArticles } from "@/pages/admin/Articles";
import { AdminOrders } from "@/pages/admin/Orders";
import { AdminSettings } from "@/pages/admin/Settings";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { CustomerLogin } from "@/pages/customer/Login";
import { CustomerSignup } from "@/pages/customer/Signup";
import { CustomerDashboard } from "@/pages/customer/CustomerDashboard";
import { CustomerProfile } from "@/pages/customer/Profile";
import { CustomerOrders } from "@/pages/customer/CustomerOrders";
import { CustomerLayout } from "@/components/Layout/CustomerLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { ScrollToTop } from "./components/ScrollToTop";
import { Checkout } from "@/pages/payment/Checkout";
import { Cart } from "@/pages/Cart";
import { Orders } from "@/pages/orders/Orders";
import { OrderConfirmation } from "./pages/orders/OrderConfirmation";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
};

const ProtectedCustomerRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log("Customer auth check - user:", user);

  if (!user) {
    console.log("No customer user, redirecting to login");
    return <Navigate to="/customer/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/orders" element={<Orders />} />

            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/signup" element={<CustomerSignup />} />

            <Route
              path="/customer"
              element={
                <ProtectedCustomerRoute>
                  <CustomerLayout />
                </ProtectedCustomerRoute>
              }
            >
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="orders" element={<CustomerOrders />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
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
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
