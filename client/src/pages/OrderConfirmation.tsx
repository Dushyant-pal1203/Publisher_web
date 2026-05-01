// src/pages/OrderConfirmation.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/common/Button";
import { CheckCircle, ShoppingBag, Home, FileText } from "lucide-react";
import toast from "react-hot-toast";

export const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData } = location.state || {};

  useEffect(() => {
    if (orderData) {
      // Save order to localStorage
      const savedOrders = localStorage.getItem("userOrders");
      const orders = savedOrders ? JSON.parse(savedOrders) : [];

      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newOrder = {
        ...orderData,
        orderId,
        status: "pending",
      };

      orders.unshift(newOrder); // Add to beginning of array
      localStorage.setItem("userOrders", JSON.stringify(orders));

      // Clear cart
      localStorage.removeItem("checkoutCart");
    }
  }, [orderData]);

  if (!orderData) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your order. We'll process it shortly.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-medium text-gray-900">Generating...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-bold text-gray-900">
                  {orderData.currency === "INR" ? "₹" : "₹"}
                  {orderData.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="text-gray-900">
                  {orderData.paymentMethod === "whatsapp"
                    ? "WhatsApp Order"
                    : "Bank Transfer/UPI"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="text-gray-900 text-right max-w-[60%]">
                  {orderData.customer.address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/")}
              className="gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-gray-50 hover:text-black"
            >
              <Home className="h-4 w-4" />
              Continue Shopping
            </Button>
            <Button
              onClick={() => navigate("/orders")}
              className="gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black"
            >
              <ShoppingBag className="h-4 w-4" />
              My Orders
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
