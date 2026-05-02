// client/src/pages/customer/CustomerDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { customerOrderAPI } from "@/lib/customerApi";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  ArrowRight,
  User,
  Truck,
  Eye,
  Search,
  Calendar,
} from "lucide-react";

interface CustomerOrder {
  id: number;
  article_title: string;
  article_author: string;
  quantity: number;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  tracking_number?: string;
  estimated_delivery?: string;
}

export const CustomerDashboard = () => {
  const { user, loading: authLoading } = useCustomerAuth();
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomerData();
    }
  }, [user]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await customerOrderAPI.getMyOrders();
      const orders = response.data.orders || [];
      setRecentOrders(orders.slice(0, 5));

      // Calculate stats
      const delivered = orders.filter(
        (o: CustomerOrder) => o.status === "delivered",
      );
      const pending = orders.filter((o: CustomerOrder) =>
        ["pending", "processing", "shipped"].includes(o.status),
      );
      const totalSpent = delivered.reduce(
        (sum: number, o: CustomerOrder) => sum + o.total_amount,
        0,
      );

      setStats({
        totalOrders: orders.length,
        deliveredOrders: delivered.length,
        pendingOrders: pending.length,
        totalSpent: totalSpent,
      });
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Please Login
        </h2>
        <p className="text-gray-500 mb-6">Login to view your dashboard.</p>
        <Link
          to="/customer/login"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.first_name || "Customer"}!
            </h1>
            <p className="text-blue-100">
              Track your orders, manage your profile, and discover new
              publications.
            </p>
          </div>
          <Link
            to="/customer/orders/new"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            + New Order
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.deliveredOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{stats.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <p className="text-sm text-gray-500 mt-1">Your latest purchases</p>
          </div>
          <Link
            to="/customer/orders"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <Link
              to="/catalogue"
              className="text-blue-600 text-sm mt-2 inline-block hover:underline"
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        #{order.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {order.article_title}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {order.article_author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {order.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/customer/orders/${order.id}`}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Contact our support team for assistance with your orders.
          </p>
          <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
            Contact Support →
          </button>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-2">Discover More</h3>
          <p className="text-sm text-gray-600 mb-4">
            Explore our latest collection of books and journals.
          </p>
          <Link
            to="/catalogue"
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            Browse Catalogue →
          </Link>
        </div>
      </div>
    </div>
  );
};
