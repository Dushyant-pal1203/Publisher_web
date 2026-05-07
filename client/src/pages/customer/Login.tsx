import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/common/Button";
import { Mail, Phone, BookOpen, UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const CustomerLogin = () => {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const { login, loginWithOTP, sendOTP } = useCustomerAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate("/customer/dashboard");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingOtp(true);
    const success = await sendOTP(phoneNumber);
    setSendingOtp(false);
    if (success) {
      setShowOtpInput(true);
      toast.success("OTP sent! Please check your phone.", {
        duration: 3000,
      });
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await loginWithOTP(phoneNumber, otp);
    setLoading(false);
    // Navigation is handled inside loginWithOTP
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src="/images/ph-logo.png"
              alt="Logo"
              className="h-20 w-20 rounded-full shadow hover:shadow-lg hover:shadow-cyan-600 transition mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Customer Login</h1>
          <p className="text-gray-600 mt-2">
            Access your account to track orders
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setMethod("email");
              setShowOtpInput(false);
              setOtp("");
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              method === "email"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </button>
          <button
            onClick={() => {
              setMethod("phone");
              setShowOtpInput(false);
              setOtp("");
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              method === "phone"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Phone (OTP)
          </button>
        </div>

        {method === "email" ? (
          <form onSubmit={handleEmailLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={showOtpInput ? handleOTPLogin : handleSendOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91XXXXXXXXXX"
                required
                disabled={showOtpInput || sendingOtp}
              />
            </div>
            {showOtpInput && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6-digit code"
                  required
                  disabled={loading}
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  disabled={sendingOtp}
                >
                  Resend OTP
                </button>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || sendingOtp}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Verifying...
                </>
              ) : sendingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Sending OTP...
                </>
              ) : showOtpInput ? (
                "Verify & Login"
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/customer/signup"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
          >
            <UserPlus className="h-3 w-3" />
            Create new account
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
