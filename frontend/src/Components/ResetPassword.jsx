import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, KeyRound, ArrowLeft } from "lucide-react";
import bnblogo from "../assets/bnblogo.png";
import { sendOTP, verifyOTP, resetPassword } from "../Services";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDarkModeStore } from "../store";

const ResetPassword = () => {
  const { globalDarkState } = useDarkModeStore();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Helper function to get error message based on status code
  const getErrorMessage = (error, defaultMessage) => {
    const status = error?.response?.status || error?.status;
    const serverMessage = error?.response?.data?.message || error?.message;

    switch (status) {
      case 400:
        return serverMessage || "Invalid request. Please check your input.";
      case 401:
        return "Unauthorized. Please check your credentials.";
      case 404:
        return "User not found. Please check your email address.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return serverMessage || defaultMessage;
    }
  };

  // Send OTP Mutation
  const {
    mutate: sendOTPMutation,
    isPending: isSendingOTP,
    isError: isSendOTPError,
    error: sendOTPError,
  } = useMutation({
    mutationFn: (email) => sendOTP(email),
    onSuccess: () => {
      toast.success("OTP sent to your email!");
      setStep(2);
    },
    onError: (err) => {
      console.error("Send OTP error:", err);
      const errorMessage = getErrorMessage(
        err,
        "Failed to send OTP. Please try again."
      );
      toast.error(errorMessage);
    },
  });

  // Verify OTP Mutation
  const {
    mutate: verifyOTPMutation,
    isPending: isVerifyingOTP,
    isError: isVerifyOTPError,
    error: verifyOTPError,
  } = useMutation({
    mutationFn: ({ email, otp }) => verifyOTP(email, otp),
    onSuccess: () => {
      toast.success("OTP verified successfully!");
      setStep(3);
    },
    onError: (err) => {
      console.error("Verify OTP error:", err);
      const status = err?.response?.status || err?.status;
      let errorMessage;

      switch (status) {
        case 400:
          const serverMsg = err?.response?.data?.message || err?.message;
          if (serverMsg && serverMsg.toLowerCase().includes("expired")) {
            errorMessage = "OTP has expired. Please request a new one.";
          } else if (serverMsg && serverMsg.toLowerCase().includes("invalid")) {
            errorMessage = "Invalid OTP. Please check and try again.";
          } else {
            errorMessage = "OTP verification failed. Please try again.";
          }
          break;
        case 404:
          errorMessage = "User not found. Please check your email address.";
          break;
        default:
          errorMessage = getErrorMessage(err, "Invalid OTP. Please try again.");
      }

      toast.error(errorMessage);
    },
  });

  // Reset Password Mutation
  const {
    mutate: resetPasswordMutation,
    isPending: isResettingPassword,
    isError: isResetPasswordError,
    error: resetPasswordError,
  } = useMutation({
    mutationFn: ({ email, newPassword }) =>
      resetPassword(email, newPassword),
    onSuccess: () => {
      toast.success(
        "Password reset successfully! You can now sign in with your new password."
      );
      navigate("/sign-in", { replace: true });
    },
    onError: (err) => {
      console.error("Reset password error:", err);
      const status = err?.response?.status || err?.status;
      let errorMessage;

      switch (status) {
        case 400:
          errorMessage =
            "Invalid request. Please check your input and try again.";
          break;
        case 404:
          errorMessage = "User not found. Please start the process again.";
          break;
        case 500:
          errorMessage = "Server error occurred. Please try again later.";
          break;
        default:
          errorMessage = getErrorMessage(
            err,
            "Failed to reset password. Please try again."
          );
      }

      toast.error(errorMessage);
    },
  });

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    sendOTPMutation(email);
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      toast.error("Please enter complete 4-digit OTP");
      return;
    }
    verifyOTPMutation({ email, otp: otpString });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    resetPasswordMutation({ email, newPassword });
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="space-y-6">
            {isSendOTPError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  {getErrorMessage(
                    sendOTPError,
                    "Failed to send OTP. Please try again."
                  )}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${
                  globalDarkState ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    globalDarkState ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSendingOTP}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    globalDarkState
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                  } ${isSendingOTP ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingOTP}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                isSendingOTP
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : ""
              }`}
            >
              {isSendingOTP ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {isVerifyOTPError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  {(() => {
                    const status =
                      verifyOTPError?.response?.status ||
                      verifyOTPError?.status;
                    const serverMsg =
                      verifyOTPError?.response?.data?.message ||
                      verifyOTPError?.message;

                    switch (status) {
                      case 400:
                        if (
                          serverMsg &&
                          serverMsg.toLowerCase().includes("expired")
                        ) {
                          return "OTP has expired. Please request a new one.";
                        } else if (
                          serverMsg &&
                          serverMsg.toLowerCase().includes("invalid")
                        ) {
                          return "Invalid OTP. Please check and try again.";
                        } else {
                          return "OTP verification failed. Please try again.";
                        }
                      case 404:
                        return "User not found. Please check your email address.";
                      default:
                        return getErrorMessage(
                          verifyOTPError,
                          "Invalid OTP. Please try again."
                        );
                    }
                  })()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${
                  globalDarkState ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Enter 4-Digit OTP
              </label>
              <p
                className={`text-xs ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                We've sent a verification code to {email}
              </p>
              <div className="flex justify-center space-x-3 mt-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    disabled={isVerifyingOTP}
                    className={`w-14 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      globalDarkState
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                    } ${isVerifyingOTP ? "opacity-50 cursor-not-allowed" : ""}`}
                    required
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingOTP}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                isVerifyingOTP
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : ""
              }`}
            >
              {isVerifyingOTP ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => sendOTPMutation(email)}
                disabled={isSendingOTP}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {isResetPasswordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  {(() => {
                    const status =
                      resetPasswordError?.response?.status ||
                      resetPasswordError?.status;

                    switch (status) {
                      case 400:
                        return "Invalid request. Please check your input and try again.";
                      case 404:
                        return "User not found. Please start the process again.";
                      case 500:
                        return "Server error occurred. Please try again later.";
                      default:
                        return getErrorMessage(
                          resetPasswordError,
                          "Failed to reset password. Please try again."
                        );
                    }
                  })()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${
                  globalDarkState ? "text-gray-300" : "text-gray-700"
                }`}
              >
                New Password
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    globalDarkState ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  <Lock size={20} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isResettingPassword}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    globalDarkState
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                  } ${
                    isResettingPassword ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isResettingPassword}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    globalDarkState
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors ${
                    isResettingPassword ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${
                  globalDarkState ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    globalDarkState ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  <KeyRound size={20} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isResettingPassword}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    globalDarkState
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                  } ${
                    isResettingPassword ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isResettingPassword}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    globalDarkState
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors ${
                    isResettingPassword ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isResettingPassword}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                isResettingPassword
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : ""
              }`}
            >
              {isResettingPassword ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Reset Password 🔒";
      case 2:
        return "Verify OTP 📱";
      case 3:
        return "Set New Password 🔑";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Enter your email to receive OTP";
      case 2:
        return "Enter the 4-digit code sent to your email";
      case 3:
        return "Create a new secure password";
      default:
        return "";
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        globalDarkState ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`w-full max-w-md transition-all duration-300 ${
            globalDarkState
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } rounded-2xl shadow-2xl border p-8`}
        >
          {/* Back button */}
          {step > 1 && (
            <div className="mb-6">
              <button
                onClick={goBack}
                className={`flex items-center space-x-2 text-sm ${
                  globalDarkState
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-800"
                } transition-colors`}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <div>
              <img className="w-20 h-20" src={bnblogo} alt="Logo" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1
              className={`text-3xl font-bold mb-2 ${
                globalDarkState ? "text-white" : "text-gray-900"
              }`}
            >
              {getStepTitle()}
            </h1>
            <p
              className={`text-sm ${
                globalDarkState ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {getStepDescription()}
            </p>
          </div>

          {renderStep()}

          <div className="text-center mt-6">
            <p
              className={`text-sm ${
                globalDarkState ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Remember your password?{" "}
              <Link
                to="/sign-in"
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
