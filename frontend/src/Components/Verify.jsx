import React, { useState, useRef, useEffect } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import bnblogo from "../assets/bnblogo.png";
import { verifyOTP, resendOTP, getUser } from "../Services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDarkModeStore } from "../store";
import { userAuthenticatedStore } from "../store";

const Verify = () => {
  const { globalDarkState } = useDarkModeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get email from navigation state or fallback
  const email = localStorage.getItem("email");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(5);
  const [canResend, setCanResend] = useState(false);
  const [userEmail,setUserEmail] = useState();

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Redirect if no email provided

  const userId = userAuthenticatedStore((state)=>state.userId)

  const getUserDetails = async() => {
    const res = await getUser(userId);
    setUserEmail(res.user.Email);
  }

  useEffect(() => {
    getUserDetails();
    if (!email) {
      toast.error("Please sign up first to verify your account");
      // navigate("/sign-up", { replace: true });
    }
  }, [email, navigate]);

  const {
    mutate: verifyUser,
    isPending: isVerifying,
    isError: isVerifyError,
    error: verifyError,
  } = useMutation({
    mutationFn: ({ email, otp }) => verifyOTP(userEmail, otp),
    onSuccess: (data) => {
      // userAuthenticatedStore.getState().setUser(data.userId, data.token);

      // Handle server success response
      if (data?.success) {
        toast.success(data.message || "Account verified successfully!");
      } else {
        toast.success("Account verified successfully!");
      }

      // Store user data in query cache
      if (data?.userId) {
        queryClient.setQueryData(["currentUser"], data);
        console.log("User data cached successfully");
      }

      // Navigate to dashboard
      try {
        console.log("Attempting to navigate to dashboard...");
        navigate("/sign-in", { replace: true });
        console.log("Navigation successful");
      } catch (error) {
        console.error("Navigation error:", error);
        toast.error(
          "Verification successful but navigation failed. Please try refreshing the page."
        );
      }
    },
    onError: (err) => {
      console.error("Verification error:", err);

      // Handle specific server error messages
      let errorMessage = "Verification failed. Please try again.";

      if (err?.response?.data?.message) {
        const serverMessage = err.response.data.message;

        // Map server messages to user-friendly messages
        switch (serverMessage) {
          case "User not found":
            errorMessage = "Account not found. Please sign up first.";
            break;
          case "OTP has expired":
            errorMessage = "OTP has expired. Please request a new code.";
            // Auto-enable resend when OTP expires
            setCanResend(true);
            setTimer(0);
            break;
          case "Invalid OTP":
            errorMessage = "Invalid OTP. Please check and try again.";
            break;
          case "OTP Verification failed":
            errorMessage = "Verification failed. Please try again.";
            break;
          default:
            errorMessage = serverMessage;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);

      // Clear OTP on error
      setOtp(["", "", "", ""]);
      inputRefs[0].current?.focus();
    },
  });

  const { mutate: resendCode, isPending: isResending } = useMutation({
    mutationFn: (userEmail) => resendOTP(userEmail),
    onSuccess: (data) => {
      // Handle server success response for resend
      if (data?.success) {
        toast.success(data.message || "OTP sent successfully!");
      } else {
        toast.success("OTP sent successfully!");
      }

      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      inputRefs[0].current?.focus();
    },
    onError: (err) => {
      console.error("Resend OTP error:", err);

      // Handle specific server error messages for resend
      let errorMessage = "Failed to resend OTP. Please try again.";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    },
  });

  const handleOtpChange = (index, value) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }

    // Move to next input on arrow right
    if (e.key === "ArrowRight" && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Move to previous input on arrow left
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 4) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs[3].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    if (!isVerifying) {
      await getUser(userId)
      verifyUser({ userEmail, otp: otpString });
    }
  };

  const handleResendOTP = () => {
    if (canResend && !isResending) {
      resendCode(userEmail);
    }
  };

  const handleBackToSignUp = () => {
    navigate("/sign-up", { replace: true });
  };

  // Add debugging for navigation hook
  React.useEffect(() => {
    if (!navigate) {
      console.error(
        "Navigate function is not available. Check if component is wrapped with Router."
      );
    }
  }, [navigate]);

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
          {/* Back Button */}
          <div className="flex justify-start mb-6">
            <button
              onClick={handleBackToSignUp}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                globalDarkState
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign Up</span>
            </button>
          </div>

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
              Verify Your Account
            </h1>
            <p
              className={`text-sm mb-2 ${
                globalDarkState ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Enter the 4-digit code sent to
            </p>
            <p
              className={`text-sm font-medium ${
                globalDarkState ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isVerifyError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  {verifyError?.response?.data?.message ||
                    verifyError?.message ||
                    "Verification failed. Please try again."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <label
                className={`text-sm font-medium ${
                  globalDarkState ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Verification Code
              </label>

              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isVerifying || isResending}
                    className={`w-14 h-14 text-center text-xl font-semibold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      globalDarkState
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                    } ${
                      isVerifying || isResending
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              onClick={(e) => handleSubmit(e)}
              disabled={isVerifying || otp.join("").length !== 4}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                isVerifying || otp.join("").length !== 4
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : ""
              }`}
            >
              {isVerifying ? "Verifying..." : "Verify Account"}
            </button>

            <div className="text-center space-y-2">
              <p
                className={`text-sm ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Didn't receive the code?
              </p>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className={`text-sm font-medium transition-colors ${
                    isResending
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              ) : (
                <p
                  className={`text-sm ${
                    globalDarkState ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Resend code in {Math.floor(timer / 60)} minutes and{" "}
                  {Math.floor(timer % 60)} sec
                </p>
              )}
            </div>

            <div className="text-center mt-6">
              <p
                className={`text-sm ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Already have an account?{" "}
                <Link
                  to="/sign-in"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verify;
