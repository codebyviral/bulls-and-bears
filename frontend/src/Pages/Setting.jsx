import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { useDarkModeStore, userAuthenticatedStore } from "../store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getDecryptedToken } from "../utils/cryptoUtil.js";
import { Link } from "react-router-dom";

function Setting() {
  const [formData, setFormData] = useState({
    userName: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // profile | password

  const { globalDarkState } = useDarkModeStore();
  const userId = userAuthenticatedStore((state) => state.userId);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData.fullName) {
      setFormData((p) => ({ ...p, userName: userData.fullName }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((p) => ({ ...p, [field]: !p[field] }));
  };



  const validateForm = () => {
    if (activeTab === "profile" && !formData.userName.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (activeTab === "password") {
      if (!formData.newPassword) {
        toast.error("New password is required");
        return false;
      }
      if (formData.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ before any await

    if (!validateForm()) return;
    if (!userId) {
      toast.error("User ID not found. Please login again.");
      return;
    }

    setIsLoading(true);
    try {
      const passPhrase = import.meta.env.VITE_AES_KEY;
      const token = await getDecryptedToken("auth_token", passPhrase);
      const requestData = { userId };

      if (activeTab === "profile" || formData.userName.trim()) {
        requestData.userName = formData.userName.trim();
      }
      if (activeTab === "password") {
        requestData.Password = formData.newPassword;
      }

      const res = await fetch("http://localhost:3000/api/user/changeDetail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      // update local storage if username changed
      if (requestData.userName) {
        const old = JSON.parse(localStorage.getItem("userData") || "{}");
        localStorage.setItem(
          "userData",
          JSON.stringify({ ...old, fullName: requestData.userName })
        );
      }

      toast.success(
        activeTab === "profile"
          ? "Profile updated successfully!"
          : "Password changed successfully!"
      );

      if (activeTab === "password") {
        setFormData((p) => ({ ...p, newPassword: "", confirmPassword: "" }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        globalDarkState ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 backdrop-blur-md border-b transition-colors duration-300 ${
          globalDarkState
            ? "bg-slate-900/80 border-slate-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            className={`p-2 rounded-lg border shadow-sm hover:shadow-md transition ${
              globalDarkState
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                : "bg-white hover:bg-gray-50 border-gray-200 text-gray-900"
            }`}
          >
            <Link to ="/" >
            <ArrowLeft className="w-5 h-5" />
            </Link>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                Settings
              </h1>
              <p
                className={`text-sm ${
                  globalDarkState ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage your account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div
            className={`rounded-xl border p-4 shadow-lg ${
              globalDarkState
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
          >
            <nav className="space-y-2">
              {["profile", "password"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                    activeTab === tab
                      ? `${
                          globalDarkState
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                        } shadow-md`
                      : `${
                          globalDarkState
                            ? "text-gray-300 hover:bg-slate-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                  }`}
                >
                  {tab === "profile" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {tab === "profile" ? "Profile" : "Password"}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-3">
          <div
            className={`rounded-xl border shadow-lg ${
              globalDarkState
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b ${
                globalDarkState ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  globalDarkState ? "text-white" : "text-gray-900"
                }`}
              >
                {activeTab === "profile"
                  ? "Profile Settings"
                  : "Change Password"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {activeTab === "profile" ? (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      globalDarkState ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        globalDarkState ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none ${
                        globalDarkState
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  {["newPassword", "confirmPassword"].map((field, i) => (
                    <div key={field}>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          globalDarkState ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {i === 0 ? "New Password" : "Confirm Password"}
                      </label>
                      <div className="relative">
                        <Lock
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                            globalDarkState ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <input
                          type={
                            showPasswords[i === 0 ? "new" : "confirm"]
                              ? "text"
                              : "password"
                          }
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-11 py-3 rounded-lg border focus:outline-none ${
                            globalDarkState
                              ? "bg-slate-700 border-slate-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          placeholder={
                            i === 0 ? "Enter new password" : "Confirm password"
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility(i === 0 ? "new" : "confirm")
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords[i === 0 ? "new" : "confirm"] ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-end pt-6 border-t border-slate-700/50">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                    isLoading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
