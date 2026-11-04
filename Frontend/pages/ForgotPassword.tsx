import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API_BASE_URL from "../utils/api";

interface ForgotPasswordPageProps {}

const ForgotPassword: React.FC<ForgotPasswordPageProps> = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Start countdown timer for OTP resend
  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      console.log("ForgotPassword → sending OTP to:", email);
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({} as any));
      console.log("ForgotPassword → forgot-password response:", response.status, data);

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to send OTP");
        return;
      }

      setMessage(data.message || "OTP sent to your email! Check your inbox.");
      setStep("otp");
      startCountdown();
    } catch (error: any) {
      console.error("Request OTP error:", error);
      setErrorMessage(error.message || "Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (otp.length !== 6) {
      setErrorMessage("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      console.log("ForgotPassword → verifying OTP:", otp);
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp_code: otp }),
      });

      const data = await response.json().catch(() => ({} as any));
      console.log("ForgotPassword → verify-otp response:", response.status, data);

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid OTP");
        return;
      }

      setMessage(data.message || "OTP verified! Now set your new password.");
      setStep("password");
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      setErrorMessage(error.message || "Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      console.log("ForgotPassword → resetting password for:", email);
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          otp_code: otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({} as any));
      console.log("ForgotPassword → reset-password response:", response.status, data);

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to reset password");
        return;
      }

      setMessage(data.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setErrorMessage(error.message || "Error resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setErrorMessage("");
    setMessage("");
    setLoading(true);

    try {
      console.log("ForgotPassword → resend OTP to:", email);
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({} as any));
      console.log("ForgotPassword → resend forgot-password response:", response.status, data);

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to resend OTP");
        return;
      }

      setMessage(data.message || "OTP resent to your email!");
      setOtp("");
      startCountdown();
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setErrorMessage(error.message || "Error resending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
            🔐
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
          <p className="text-gray-600">Secure your account with a new password</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          <div
            className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
              step === "email" || step === "otp" || step === "password"
                ? "bg-blue-500"
                : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
              step === "otp" || step === "password" ? "bg-blue-500" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
              step === "password" ? "bg-blue-500" : "bg-gray-200"
            }`}
          ></div>
        </div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded"
          >
            ✅ {message}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
          >
            ❌ {errorMessage}
          </motion.div>
        )}

        {/* Step 1: Email */}
        {step === "email" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleRequestOTP}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "⏳ Sending..." : "📬 Send OTP"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full text-blue-600 py-2 hover:underline"
            >
              Back to Login
            </button>
          </motion.form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleVerifyOTP}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔐 Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-center text-2xl tracking-widest font-mono"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Check your email for the OTP code
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "⏳ Verifying..." : "✅ Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || loading}
              className="w-full text-blue-600 py-2 hover:underline disabled:opacity-50"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : "🔄 Resend OTP"}
            </button>
          </motion.form>
        )}

        {/* Step 3: Password Reset */}
        {step === "password" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleResetPassword}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔑 New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔑 Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500">
              Password must be at least 6 characters long
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "⏳ Resetting..." : "🎉 Reset Password"}
            </button>
          </motion.form>
        )}
      </motion.div>

      {/* Background decorative elements */}
      <div className="fixed -top-20 -left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="fixed -bottom-20 -right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
    </div>
  );
};

export default ForgotPassword;
