import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Email: email,
                    Password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Check if user is admin
                if (data.isAdmin === true) {



                    // Store token in localStorage
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userId", data.userId);
                    localStorage.setItem("isAdmin", data.isAdmin);

                    console.log("Login successful:", data);
                    toast.success("Login successful! Welcome Admin");
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 1000); 


                } else {
                    // User is not admin, don't allow login
                    //   setError("Access denied. Admin privileges required.");
                    toast.error("Access denied. Admin privileges required.")
                }
            } else {
                // Handle error from API
                toast.error("user not found")
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <ToastContainer
                position="top-center"
            />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Circles */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>


                {/* Floating Icons */}
                <div className="absolute top-1/4 left-1/4 animate-float">
                    <Mail className="w-12 h-12 text-blue-300 opacity-20" />
                </div>
                <div className="absolute top-1/3 right-1/4 animate-float animation-delay-1000">
                    <Lock className="w-16 h-16 text-purple-300 opacity-20" />
                </div>
                <div className="absolute bottom-1/4 left-1/3 animate-float animation-delay-2000">
                    <Mail className="w-14 h-14 text-pink-300 opacity-20" />
                </div>
                <div className="absolute top-1/2 right-1/3 animate-float animation-delay-3000">
                    <Lock className="w-10 h-10 text-blue-300 opacity-20" />
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-40px) rotate(-5deg);
          }
          75% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>

            <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
                <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-8 transform transition-all duration-500 hover:shadow-3xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-gray-900">
                            Admin Login
                        </h1>
                        <div className="flex items-center justify-center">
                            <img
                                className="size-36 animate-bounce-gentle"
                                src="https://bazaar-frontend-app.onrender.com/assets/bnblogo-DNVH0CEp.png"
                                alt="logo"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${isLoading ? "opacity-50 cursor-not-allowed hover:scale-100" : ""
                                }`}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;