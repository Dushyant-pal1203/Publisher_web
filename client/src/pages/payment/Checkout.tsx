import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/common/Button";
import { orderAPI, articleAPI, customerOrderAPI } from "@/lib/api";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  CreditCard,
  MessageCircle,
  Phone,
  MapPin,
  Mail,
  User,
  AlertCircle,
  UserCheck,
  LogIn,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

type OrderFormData = {
  fullName: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  orderNotes: string;
  paymentMethod: "whatsapp" | "bank_transfer";
};

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: customerUser, loading: authLoading } = useCustomerAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    deliveryAddress: "",
    orderNotes: "",
    paymentMethod: "whatsapp",
  });
  const [errors, setErrors] = useState<Partial<OrderFormData>>({});

  // Auto-fill form if customer is logged in
  useEffect(() => {
    if (customerUser && !formData.fullName) {
      setFormData((prev) => ({
        ...prev,
        fullName:
          `${customerUser.first_name || ""} ${customerUser.last_name || ""}`.trim(),
        email: customerUser.email || "",
        phoneNumber: customerUser.phone_number || "",
      }));
    }
  }, [customerUser]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !location.state?.cartItems) {
      showError("Your cart is empty");
      navigate("/");
    }
  }, [cartItems, location, navigate, showError]);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9\s\-\(\)]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Complete delivery address is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof OrderFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentMethodChange = (method: "whatsapp" | "bank_transfer") => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const saveOrderToDatabase = async (orderData: any) => {
    try {
      // Create order in database for each item
      const orderPromises = cartItems.map(async (item) => {
        const orderPayload = {
          article_id: item.id,
          article_title: item.title,
          article_author: item.author,
          quantity: item.quantity,
          customer_name: orderData.customer.name,
          customer_email: orderData.customer.email,
          customer_phone: orderData.customer.phone,
          customer_address: orderData.customer.address,
          payment_method: orderData.paymentMethod,
          total_amount: item.price * item.quantity,
          currency: item.currency || "INR",
          notes: orderData.notes,
          status: "pending",
        };

        const response = await orderAPI.create(orderPayload);
        return response.data?.order || response.data;
      });

      const savedOrders = await Promise.all(orderPromises);
      return savedOrders;
    } catch (error: any) {
      console.error("Failed to save order to database:", error);
      // Don't throw error - we still have local storage backup
      return null;
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      showError("Please fill in all required fields");
      return;
    }

    // Final stock validation before order
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        showError(
          `${item.title} is only available in quantity ${item.stock_quantity}`,
        );
        return;
      }
    }

    setLoading(true);

    const orderData = {
      items: cartItems,
      total: calculateTotal(),
      customer: {
        name: formData.fullName,
        phone: formData.phoneNumber,
        email: formData.email || null,
        address: formData.deliveryAddress,
      },
      notes: formData.orderNotes,
      paymentMethod: formData.paymentMethod,
      orderDate: new Date().toISOString(),
      customerId: customerUser?.id || null,
    };

    // Generate order ID first (for localStorage)
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      // Try to update stock (but don't fail if it doesn't work)
      try {
        const stockUpdates = cartItems.map(async (item) => {
          const newStockQuantity = Math.max(
            0,
            item.stock_quantity - item.quantity,
          );
          await articleAPI.update(item.id, {
            stock_quantity: newStockQuantity,
            in_stock: newStockQuantity > 0,
          });
        });
        await Promise.all(stockUpdates);
      } catch (stockError) {
        console.error("Failed to update stock (non-critical):", stockError);
        // Don't throw - continue with order
      }

      // Try to save to database (optional - don't fail if it doesn't work)
      let savedOrders = null;
      try {
        const orderPromises = cartItems.map(async (item) => {
          const orderPayload = {
            article_id: item.id,
            article_title: item.title,
            article_author: item.author,
            quantity: item.quantity,
            customer_name: orderData.customer.name,
            customer_email: orderData.customer.email,
            customer_phone: orderData.customer.phone,
            customer_address: orderData.customer.address,
            payment_method: orderData.paymentMethod,
            total_amount: item.price * item.quantity,
            currency: item.currency || "INR",
            notes: orderData.notes,
            status: "pending",
          };

          const response = await orderAPI.create(orderPayload);
          return response.data?.order || response.data;
        });

        savedOrders = await Promise.all(orderPromises);
        console.log("Orders saved to database:", savedOrders);
      } catch (dbError) {
        console.error("Database save failed (non-critical):", dbError);
        // Continue - order is saved in localStorage
      }

      // Save to localStorage (THIS IS THE PRIMARY STORAGE METHOD)
      const newOrder = {
        ...orderData,
        orderId,
        status: "pending",
        databaseId: savedOrders?.[0]?.id || null,
        orderDate: new Date().toISOString(),
      };

      // Save to main userOrders
      const savedOrdersLocal = localStorage.getItem("userOrders");
      const orders = savedOrdersLocal ? JSON.parse(savedOrdersLocal) : [];
      orders.unshift(newOrder);
      localStorage.setItem("userOrders", JSON.stringify(orders));

      // If user is logged in, also store in user-specific storage
      if (customerUser) {
        const userOrdersKey = `user_orders_${customerUser.id}`;
        const existingUserOrders = localStorage.getItem(userOrdersKey);
        const userOrders = existingUserOrders
          ? JSON.parse(existingUserOrders)
          : [];
        userOrders.unshift(newOrder);
        localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));

        // Also store the order in the backend user_orders if possible
        try {
          // Optional: Sync with backend user orders
          await customerOrderAPI?.syncOrder?.({
            ...newOrder,
            userId: customerUser.id,
          });
        } catch (syncError) {
          console.error("Failed to sync order with backend:", syncError);
        }
      }

      // Store as last placed order for confirmation page
      localStorage.setItem("lastPlacedOrder", JSON.stringify(newOrder));

      // Clear cart
      clearCart();

      // Handle WhatsApp redirect if needed
      if (formData.paymentMethod === "whatsapp") {
        const message = formatWhatsAppMessage(orderData);
        const whatsappNumber =
          import.meta.env.VITE_WHATSAPP_NUMBER || "919310004022";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        showSuccess("Redirecting to WhatsApp to complete your order!");
      } else {
        showSuccess("Order placed successfully! We'll contact you shortly.");
      }

      // Navigate to order confirmation
      setTimeout(() => {
        navigate("/order-confirmation", {
          state: {
            orderData,
            savedOrders,
            orderId: savedOrders?.[0]?.id || orderId,
          },
          replace: true,
        });
      }, 1500);
    } catch (error) {
      console.error("Order submission failed:", error);
      showError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsAppMessage = (order: any): string => {
    let message = `*NEW ORDER*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${order.customer.name}\n`;
    message += `Phone: ${order.customer.phone}\n`;
    message += `Email: ${order.customer.email || "Not provided"}\n`;
    message += `Address: ${order.customer.address}\n\n`;
    message += `*Order Items:*\n`;
    order.items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.title} - ${item.quantity} x ₹${item.price}\n`;
    });
    message += `\n*Total Amount:* ₹${order.total}\n`;
    if (order.notes) {
      message += `\n*Notes:* ${order.notes}\n`;
    }
    message += `\n*Payment Method:* ${order.paymentMethod === "whatsapp" ? "WhatsApp Order" : "Bank Transfer/UPI"}\n`;
    return message;
  };

  const total = calculateTotal();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some items to your cart before checking out
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Customer Info Banner */}
        {customerUser && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  You are ordering as {customerUser.first_name}{" "}
                  {customerUser.last_name}
                </p>
                <p className="text-xs text-green-600">
                  Your order will be saved to your account
                </p>
              </div>
            </div>
          </div>
        )}

        {!customerUser && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Checking out as a guest
                </p>
                <p className="text-xs text-blue-600">
                  <Link
                    to="/customer/login"
                    className="underline hover:text-blue-800"
                  >
                    Login
                  </Link>{" "}
                  to save your order history and track easily
                </p>
              </div>
            </div>
            <Link
              to="/customer/login"
              state={{ from: "/checkout" }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Login
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Cart ({cartItems.length}{" "}
                  {cartItems.length === 1 ? "item" : "items"})
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.cover_image_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${item.cover_image_url}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        by {item.author}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        ₹{item.price}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 rounded-full hover:bg-gray-100 transition"
                          >
                            <Minus className="h-3 w-3 text-gray-500" />
                          </button>
                          <span className="text-sm font-medium text-gray-700 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.quantity + 1 <= item.stock_quantity) {
                                updateQuantity(item.id, item.quantity + 1);
                              } else {
                                showError(
                                  `Only ${item.stock_quantity} items available`,
                                );
                              }
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 transition"
                            disabled={item.quantity >= item.stock_quantity}
                          >
                            <Plus className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            ₹{item.price * item.quantity}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {item.stock_quantity <= 5 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Only {item.stock_quantity} left in stock
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{total}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total amount
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Form - Right Column */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">
                  Place your order
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Complete your purchase
                </p>
              </div>

              <div className="p-6 space-y-8">
                {/* Payment Method Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={formData.paymentMethod === "whatsapp"}
                        onChange={() => handlePaymentMethodChange("whatsapp")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-900">
                            WhatsApp order
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Confirm order details and arrange payment via
                          WhatsApp.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === "bank_transfer"}
                        onChange={() =>
                          handlePaymentMethodChange("bank_transfer")
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            Bank Transfer / UPI
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Receive payment details instantly to transfer
                          manually.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Customer Information Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customer Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.fullName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Full name"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.phoneNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Phone number"
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email{" "}
                        <span className="text-gray-400 text-xs">
                          (optional)
                        </span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.deliveryAddress
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Full street address, city, state, pin code"
                        />
                      </div>
                      {errors.deliveryAddress && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.deliveryAddress}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order notes{" "}
                        <span className="text-gray-400 text-xs">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        name="orderNotes"
                        value={formData.orderNotes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any special instructions for delivery"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => navigate("/")}
                    variant="secondary"
                    className="transition-colors"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={loading || cartItems.length === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Processing..." : `Confirm Order (₹${total})`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
