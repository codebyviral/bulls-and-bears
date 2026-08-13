import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, UserRoundPlus } from "lucide-react";
import bnblogo from "../assets/bnblogo.png";
import { sendOTP, signupUser } from "../Services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDarkModeStore } from "../store";
import { userAuthenticatedStore } from "../store";

const SignIn = () => {
  const { isAuthenticated } = userAuthenticatedStore();
  const { globalDarkState } = useDarkModeStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: signIn,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ email, password }) => signupUser(fullName, email, password),
    onSuccess: (data) => {
      if (data.msg === "user already existed") {
        toast("User with this Email already exists!");
        return;
      }

      if (data?.newuser?._id) {
        userAuthenticatedStore.getState().setUser(data.newuser._id);
        queryClient.setQueryData(["currentUser"], data.newuser);
        toast.success("Sign in to continue!");
        console.log("User data cached successfully");
      }

      // 🚀 Navigate immediately
      if (data.msg === "user created!!!") {
        navigate("/verify-user", { replace: true });
      }

      // 🔔 Send OTP in background (don’t block navigation)
      sendOTP(email).catch((err) => {
        console.error("OTP sending failed:", err);
        toast.error("OTP could not be sent. Please retry.");
      });
    },
    onError: (err) => {
      console.error("Sign-in error:", err);
      toast.error("Sign-in failed. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if(!acceptedTerms){
      toast.error('Please agree terms & conditions')
      return 
    }

    if (!isPending) {
      console.log("Attempting sign-in...");
      signIn({ email, password });
    }
  };

  // Add debugging for navigation hook
  React.useEffect(() => {
    if (!navigate) {
      console.error(
        "Navigate function is not available. Check if component is wrapped with Router.",
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
              Create New Account 📈
            </h1>
            <p
              className={`text-sm ${
                globalDarkState ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Sign up to new account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  {error?.message || "Sign-in failed. Please try again."}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${
                  globalDarkState ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Full Name
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    globalDarkState ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  <UserRoundPlus size={20} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isPending}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    globalDarkState
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter your Full Name"
                  required
                />
              </div>
            </div>

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
                  disabled={isPending}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    globalDarkState
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${
                  globalDarkState ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Password
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    globalDarkState
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    globalDarkState
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors ${
                    isPending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
              >
                Forgot Password?
              </a>
            </div>

            <div className="flex justify-center w-full">
              <div className="flex items-start gap-2.5 max-w-sm w-full px-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={isPending}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500"
                />

                <label
                  htmlFor="terms"
                  className={`text-xs sm:text-sm leading-5 cursor-pointer ${
                    globalDarkState ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  By continuing, you agree to our{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* // Signup with email */}
              <button
                type="submit"
                disabled={isPending}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                  isPending
                    ? "opacity-50 cursor-not-allowed hover:scale-100"
                    : ""
                }`}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing Up...</span>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
              {/* // Signup with google */}
              <button
                type="submit"
                disabled={isPending}
                className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                  isPending
                    ? "opacity-50 cursor-not-allowed hover:scale-100"
                    : ""
                }`}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing Up...</span>
                  </div>
                ) : (
                  <>
                    <img
                      className="w-5 h-5 object-contain"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png"
                      alt="Google"
                    />
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-center mt-6">
              <p
                className={`text-sm ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Already have an account?{" "}
                <Link
                  to="/auth/signin"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
