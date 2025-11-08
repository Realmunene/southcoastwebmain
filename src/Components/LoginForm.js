import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faLock, faShield, faUserShield } from "@fortawesome/free-solid-svg-icons";
import logo from "./images/IMG-20251008-WA0008logo0.png";

const LoginForm = ({ onAdminLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // First, get the response as text to check if it's valid JSON
      const responseText = await response.text();
      let data;

      try {
        // Try to parse the response as JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText);
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      if (response.ok) {
        // Extract admin object and token
        const admin = data.admin;
        const token = data.token;

        if (!admin || !token) {
          throw new Error("Invalid response from server");
        }

        // Store admin data in localStorage
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminEmail", admin.email);
        localStorage.setItem("adminRole", admin.role || "admin");
        localStorage.setItem("adminName", admin.name || admin.email.split('@')[0]);

        // Create admin data object
        const adminData = {
          email: admin.email,
          role: admin.role || "admin",
          name: admin.name || admin.email.split('@')[0],
          token: token
        };

        // Call the onAdminLogin callback to update parent state
        if (typeof onAdminLogin === "function") {
          onAdminLogin(adminData);
        }

        alert("Admin login successful!");

        // Navigate after a brief delay to ensure state updates
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 100);
      } else {
        alert(data.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      
      // More specific error messages
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check your internet connection and ensure the backend is running.");
      } else if (err.message.includes("Server returned an invalid response")) {
        alert("Server error: The backend is not responding properly. Please try again later.");
      } else {
        alert("Login failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src={logo} 
              alt="SouthCoast Logo" 
              className="h-12 w-auto drop-shadow-lg" 
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold">SouthCoast</h1>
              <p className="text-cyan-100 text-sm">Admin Portal</p>
            </div>
          </div>
          <div className="w-16 h-1 bg-cyan-300 rounded-full mx-auto"></div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faUserShield} className="text-cyan-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Sign In</h2>
            <p className="text-gray-600">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                  required
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FontAwesomeIcon icon={faLock} className="text-cyan-600 text-sm" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                  required
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-cyan-600 transition-colors"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faShield} className="text-white" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faUserShield} className="text-cyan-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-cyan-800">Secure Admin Access</p>
                <p className="text-xs text-cyan-600 mt-1">
                  This portal is restricted to authorized personnel only. All activities are monitored and logged.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            © 2025 SouthCoast Outdoors. Admin access only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;