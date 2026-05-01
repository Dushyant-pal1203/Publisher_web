// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/common/Button";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  MessageCircle,
  ShoppingBag,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

type OrderItem = {
  id: number;
  title: string;
  author: string;
  price: number;
  currency: string;
  quantity: number;
  cover_image_url: string | null;
};

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  orderId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string;
  };
  notes: string;
  paymentMethod: "whatsapp" | "bank_transfer";
  orderDate: string;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
};

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    // Load orders from localStorage
    const savedOrders = localStorage.getItem("userOrders");
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      // Sort by date (newest first)
      parsedOrders.sort(
        (a: Order, b: Order) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );
      setOrders(parsedOrders);
    } else {
      // Demo orders for preview
      const demoOrders = getDemoOrders();
      setOrders(demoOrders);
    }
    setLoading(false);
  };

  const getDemoOrders = (): Order[] => {
    return [
      {
        orderId: "ORD-2024-001",
        items: [
          {
            id: 1,
            title: "Journal of South Asian Studies — Vol. 12",
            author: "Editorial Board",
            price: 7899,
            currency: "INR",
            quantity: 1,
            cover_image_url: null,
          },
        ],
        total: 7899,
        currency: "INR",
        customer: {
          name: "Jane Doe",
          phone: "+91 98765 43210",
          email: "jane@example.com",
          address: "123 Main Street, Andheri East, Mumbai, Maharashtra 400001",
        },
        notes: "Please handle with care",
        paymentMethod: "whatsapp",
        orderDate: "2024-12-15T10:30:00.000Z",
        status: "delivered",
        trackingNumber: "IND123456789",
        estimatedDelivery: "2024-12-20",
      },
      {
        orderId: "ORD-2024-002",
        items: [
          {
            id: 2,
            title: "Modern Indian History",
            author: "Dr. Rajesh Kumar",
            price: 4500,
            currency: "INR",
            quantity: 2,
            cover_image_url: null,
          },
        ],
        total: 9000,
        currency: "INR",
        customer: {
          name: "Jane Doe",
          phone: "+91 98765 43210",
          email: "jane@example.com",
          address: "123 Main Street, Andheri East, Mumbai, Maharashtra 400001",
        },
        notes: "",
        paymentMethod: "bank_transfer",
        orderDate: "2024-12-10T14:20:00.000Z",
        status: "shipped",
        trackingNumber: "IND987654321",
        estimatedDelivery: "2024-12-18",
      },
      {
        orderId: "ORD-2024-003",
        items: [
          {
            id: 3,
            title: "Ancient Civilizations of India",
            author: "Prof. Anita Sharma",
            price: 3500,
            currency: "INR",
            quantity: 1,
            cover_image_url: null,
          },
        ],
        total: 3500,
        currency: "INR",
        customer: {
          name: "Jane Doe",
          phone: "+91 98765 43210",
          email: "jane@example.com",
          address: "123 Main Street, Andheri East, Mumbai, Maharashtra 400001",
        },
        notes: "Gift wrap please",
        paymentMethod: "whatsapp",
        orderDate: "2024-12-05T09:15:00.000Z",
        status: "pending",
      },
    ];
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method === "whatsapp") {
      return <MessageCircle className="h-4 w-4 text-green-600" />;
    }
    return <CreditCard className="h-4 w-4 text-blue-600" />;
  };

  const getPaymentMethodText = (method: string) => {
    return method === "whatsapp" ? "WhatsApp Order" : "Bank Transfer / UPI";
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const updatedOrders = orders.map((order) =>
        order.orderId === orderId
          ? { ...order, status: "cancelled" as OrderStatus }
          : order,
      );
      setOrders(updatedOrders);
      localStorage.setItem("userOrders", JSON.stringify(updatedOrders));
      toast.success("Order cancelled successfully!");

      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" });
      }
    }
  };

  const handleReorder = (order: Order) => {
    const cartItems = order.items.map((item) => ({
      ...item,
      cover_image_url: item.cover_image_url,
    }));
    localStorage.setItem("checkoutCart", JSON.stringify(cartItems));
    toast.success("Items added to cart!");
    navigate("/checkout", { state: { cartItems } });
  };

  const handleDownloadInvoice = (order: Order) => {
    // Create invoice HTML
    const invoiceHtml = generateInvoiceHtml(order);
    const blob = new Blob([invoiceHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${order.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded!");
  };

  const generateInvoiceHtml = (order: Order): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Invoice</h1>
          <p>Order ID: ${order.orderId}</p>
          <p>Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div class="order-info">
          <h3>Customer Information</h3>
          <p>Name: ${order.customer.name}</p>
          <p>Phone: ${order.customer.phone}</p>
          <p>Email: ${order.customer.email || "N/A"}</p>
          <p>Address: ${order.customer.address}</p>
        </div>
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr><th>Product</th><th>Author</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.title}</td>
                <td>${item.author}</td>
                <td>${item.quantity}</td>
                <td>${item.currency === "INR" ? "₹" : "$"}${item.price}</td>
                <td>${item.currency === "INR" ? "₹" : "$"}${item.price * item.quantity}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="total">
          <p>Total Amount: ${order.currency === "INR" ? "₹" : "$"}${order.total}</p>
        </div>
      </body>
      </html>
    `;
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>
          <div className="text-sm text-gray-500">
            <Package className="h-4 w-4 inline mr-1" />
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
          {[
            { key: "all", label: "All Orders", count: statusCounts.all },
            { key: "pending", label: "Pending", count: statusCounts.pending },
            {
              key: "processing",
              label: "Processing",
              count: statusCounts.processing,
            },
            { key: "shipped", label: "Shipped", count: statusCounts.shipped },
            {
              key: "delivered",
              label: "Delivered",
              count: statusCounts.delivered,
            },
            {
              key: "cancelled",
              label: "Cancelled",
              count: statusCounts.cancelled,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    filterStatus === tab.key
                      ? "bg-white text-blue-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 mb-6">
              {filterStatus !== "all"
                ? `You don't have any ${filterStatus} orders.`
                : "You haven't placed any orders yet."}
            </p>
            <Button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {order.orderId}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          {getPaymentMethodText(order.paymentMethod)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {order.currency === "INR" ? "₹" : "₹"}
                        {order.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.title}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {order.currency === "INR" ? "₹" : "₹"}
                            {item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600 line-clamp-1">
                        {order.customer.address}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      onClick={() => handleViewOrder(order)}
                      className="gap-2 px-4 py-2 text-sm border bg-white !text-black border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    {order.status !== "cancelled" &&
                      order.status !== "delivered" && (
                        <Button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="gap-2 px-4 py-2 text-sm border bg-white border-red-300 !text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Order
                        </Button>
                      )}
                    <Button
                      onClick={() => handleReorder(order)}
                      className="gap-2 px-4 py-2 text-sm bg-white border border-green-300 !text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Buy Again
                    </Button>
                    {order.status === "delivered" && (
                      <Button
                        onClick={() => handleDownloadInvoice(order)}
                        className="gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Order ID</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.orderDate).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                      {getPaymentMethodText(selectedOrder.paymentMethod)}
                    </p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div>
                      <p className="text-gray-500">Tracking Number</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  )}
                  {selectedOrder.estimatedDelivery && (
                    <div>
                      <p className="text-gray-500">Est. Delivery</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          selectedOrder.estimatedDelivery,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start border-b border-gray-100 pb-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">{item.author}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {selectedOrder.currency === "INR" ? "₹" : "₹"}
                          {item.price * item.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Delivery Address
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-gray-900">
                    {selectedOrder.customer.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedOrder.customer.phone}
                  </p>
                  {selectedOrder.customer.email && (
                    <p className="text-gray-600 text-sm">
                      {selectedOrder.customer.email}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm mt-2">
                    {selectedOrder.customer.address}
                  </p>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Order Notes
                  </h3>
                  <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-4">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedOrder.currency === "INR" ? "₹" : "₹"}
                    {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <Button onClick={handleCloseModal} variant="secondary">
                Close
              </Button>
              {selectedOrder.status !== "cancelled" &&
                selectedOrder.status !== "delivered" && (
                  <Button
                    onClick={() => {
                      handleCancelOrder(selectedOrder.orderId);
                      handleCloseModal();
                    }}
                    variant="danger"
                  >
                    Cancel Order
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
