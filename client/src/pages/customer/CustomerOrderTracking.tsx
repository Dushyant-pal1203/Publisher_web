// client/src/pages/customer/CustomerOrderTracking.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { customerOrderAPI } from "@/lib/customerApi";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowLeft,
  RefreshCw,
  Home,
  ShoppingBag,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useToast } from "@/context/ToastContext";

interface OrderDetails {
  id: number;
  article_id: number;
  article_title: string;
  article_author: string;
  quantity: number;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  created_at: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
}

// Local order type for guest orders
interface LocalOrderDetails {
  orderId: string;
  items: any[];
  total: number;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string;
  };
  notes?: string;
  paymentMethod: string;
  orderDate: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// Type guard functions
const isOrderDetails = (
  order: OrderDetails | LocalOrderDetails,
): order is OrderDetails => {
  return "id" in order && typeof order.id === "number";
};

const isLocalOrderDetails = (
  order: OrderDetails | LocalOrderDetails,
): order is LocalOrderDetails => {
  return "orderId" in order;
};

export const CustomerOrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCustomerAuth();
  const { showError, showSuccess } = useToast();
  const [order, setOrder] = useState<OrderDetails | LocalOrderDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isLocalOrder, setIsLocalOrder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id, user]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      // First try to get from database if user is logged in
      if (user && id) {
        try {
          const response = await customerOrderAPI.getOrderDetails(Number(id));
          if (response.data?.order) {
            setOrder(response.data.order);
            setIsLocalOrder(false);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log(
            "Order not found in database, checking localStorage:",
            error,
          );
        }
      }

      // If not found in database, try localStorage
      if (id) {
        const localOrder = findLocalOrder(id);
        if (localOrder) {
          setOrder(localOrder);
          setIsLocalOrder(true);
        } else {
          showError("Order not found");
          navigate("/customer/orders");
        }
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      showError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const findLocalOrder = (orderId: string): LocalOrderDetails | null => {
    // Check main userOrders
    const savedOrders = localStorage.getItem("userOrders");
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        const found = orders.find(
          (o: any) =>
            o.orderId === orderId ||
            o.orderId === `#${orderId}` ||
            o.id === parseInt(orderId) ||
            o.databaseId === parseInt(orderId),
        );
        if (found) return found;
      } catch (e) {}
    }

    // Check user-specific storage if user is logged in
    if (user?.id) {
      const userOrdersKey = `user_orders_${user.id}`;
      const userOrders = localStorage.getItem(userOrdersKey);
      if (userOrders) {
        try {
          const orders = JSON.parse(userOrders);
          const found = orders.find(
            (o: any) =>
              o.orderId === orderId ||
              o.orderId === `#${orderId}` ||
              o.id === parseInt(orderId),
          );
          if (found) return found;
        } catch (e) {}
      }
    }

    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case "shipped":
        return <Truck className="h-12 w-12 text-purple-600" />;
      case "processing":
        return <Package className="h-12 w-12 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return <Clock className="h-12 w-12 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pending Confirmation",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = steps.indexOf(status);
    return currentIndex === -1 ? -1 : currentIndex;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderDetails();
    setRefreshing(false);
    showSuccess("Order status updated!");
  };

  const handleContactSupport = () => {
    const orderId =
      order && isOrderDetails(order)
        ? order.id
        : (order as LocalOrderDetails)?.orderId;
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919310004022";
    const message = `I need help with order #${orderId}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  // Helper functions to safely access order properties
  const getOrderId = () => {
    if (!order) return "";
    return isOrderDetails(order) ? order.id : order.orderId;
  };

  const getOrderDate = () => {
    if (!order) return "";
    return isOrderDetails(order) ? order.created_at : order.orderDate;
  };

  const getCustomerName = () => {
    if (!order) return "";
    return isOrderDetails(order) ? order.customer_name : order.customer.name;
  };

  const getCustomerPhone = () => {
    if (!order) return "";
    return isOrderDetails(order) ? order.customer_phone : order.customer.phone;
  };

  const getCustomerEmail = () => {
    if (!order) return "";
    return isOrderDetails(order)
      ? order.customer_email
      : order.customer.email || "";
  };

  const getCustomerAddress = () => {
    if (!order) return "";
    return isOrderDetails(order)
      ? order.customer_address
      : order.customer.address;
  };

  const getPaymentMethod = () => {
    if (!order) return "";
    return isOrderDetails(order) ? order.payment_method : order.paymentMethod;
  };

  const getTotalAmount = () => {
    if (!order) return 0;
    return isOrderDetails(order) ? order.total_amount : order.total;
  };

  const getTrackingNumber = () => {
    if (!order) return "";
    return isOrderDetails(order) ? order.tracking_number : order.trackingNumber;
  };

  const getEstimatedDelivery = () => {
    if (!order) return "";
    return isOrderDetails(order)
      ? order.estimated_delivery
      : order.estimatedDelivery;
  };

  const getStatus = () => {
    if (!order) return "";
    return order.status;
  };

  const getNotes = () => {
    if (!order) return "";
    return order.notes;
  };

  const getOrderItems = () => {
    if (!order) return [];
    if (isLocalOrderDetails(order)) {
      return order.items;
    } else {
      return [
        {
          title: order.article_title,
          author: order.article_author,
          quantity: order.quantity,
          price: order.total_amount / order.quantity,
        },
      ];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The order you're looking for doesn't exist.
        </p>
        <Link
          to="/customer/orders"
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Orders →
        </Link>
      </div>
    );
  }

  const orderStatus = getStatus();
  const orderItems = getOrderItems();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/customer/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Track Order #{getOrderId()}
            </h1>
            <p className="text-gray-500 mt-1">
              Placed on {formatDate(getOrderDate())}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            {isLocalOrder && (
              <span className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-orange-100 text-orange-700">
                Guest Order
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {getStatusIcon(orderStatus)}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getStatusText(orderStatus)}
            </h2>
            <p className="text-gray-500 text-sm">
              {orderStatus === "delivered"
                ? "Your order has been delivered successfully!"
                : orderStatus === "shipped"
                  ? "Your order is on the way!"
                  : orderStatus === "processing"
                    ? "We're preparing your order"
                    : orderStatus === "cancelled"
                      ? "This order has been cancelled"
                      : "We've received your order and are processing it"}
            </p>
          </div>
        </div>

        {/* Order Progress Tracker */}
        {orderStatus !== "cancelled" && getStatusStep(orderStatus) !== -1 && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
              <div
                className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500"
                style={{ width: `${(getStatusStep(orderStatus) / 3) * 100}%` }}
              ></div>
              <div className="relative flex justify-between">
                {[
                  { label: "Order Placed", status: "pending", icon: Clock },
                  { label: "Processing", status: "processing", icon: Package },
                  { label: "Shipped", status: "shipped", icon: Truck },
                  {
                    label: "Delivered",
                    status: "delivered",
                    icon: CheckCircle,
                  },
                ].map((step, index) => {
                  const stepIndex = getStatusStep(orderStatus);
                  const isCompleted = index <= stepIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          isCompleted
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p
                        className={`text-xs font-medium ${isCompleted ? "text-blue-600" : "text-gray-500"}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Delivery Information
          </h3>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {getCustomerName()}
            </p>
            <p className="text-gray-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              {getCustomerPhone()}
            </p>
            {getCustomerEmail() && (
              <p className="text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {getCustomerEmail()}
              </p>
            )}
            <p className="text-gray-700 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              {getCustomerAddress()}
            </p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Order Summary
          </h3>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-medium">Payment Method:</span>{" "}
              {getPaymentMethod() === "whatsapp"
                ? "WhatsApp Order"
                : "Bank Transfer / UPI"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Order Status:</span>
              <span
                className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(orderStatus)}`}
              >
                {getStatusText(orderStatus)}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Total Amount:</span>
              <span className="ml-2 text-lg font-bold text-blue-600">
                ₹{getTotalAmount().toLocaleString()}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Order Date:</span>
              <span className="ml-2">{formatDate(getOrderDate())}</span>
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items Ordered
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Author
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderItems.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-900">{item.title}</td>
                    <td className="px-4 py-3 text-gray-600">{item.author}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      ₹
                      {(
                        item.price ||
                        (isOrderDetails(order)
                          ? order.total_amount / order.quantity
                          : 0)
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ₹
                      {(
                        (item.price ||
                          (isOrderDetails(order)
                            ? order.total_amount / order.quantity
                            : 0)) * item.quantity
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-right font-semibold text-gray-900"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    ₹{getTotalAmount().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Notes */}
        {getNotes() && (
          <div className="md:col-span-2 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Order Notes
            </h3>
            <p className="text-gray-600">{getNotes()}</p>
          </div>
        )}

        {/* Tracking Information (if shipped) */}
        {getTrackingNumber() && orderStatus === "shipped" && (
          <div className="md:col-span-2 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Tracking Information
            </h3>
            <p className="text-gray-700">
              <span className="font-medium">Tracking Number:</span>{" "}
              <span className="font-mono">{getTrackingNumber()}</span>
            </p>
            {getEstimatedDelivery() && (
              <p className="text-gray-700 mt-1">
                <span className="font-medium">Estimated Delivery:</span>{" "}
                {new Date(getEstimatedDelivery()!).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 mt-8">
        <Link to="/catalogue">
          <Button variant="secondary" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
        <div className="flex gap-3">
          <Link to="/customer/orders">
            <Button variant="secondary" className="gap-2">
              <Home className="h-4 w-4" />
              All Orders
            </Button>
          </Link>
          <Button
            onClick={handleContactSupport}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4" />
            Need Help?
          </Button>
        </div>
      </div>
    </div>
  );
};
