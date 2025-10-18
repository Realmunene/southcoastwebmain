import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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
      const response = await fetch("http://localhost:3000/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

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
      alert("Server connection failed. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-800 to-cyan-400 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="mx-auto h-10 mb-2" />
          <h2 className="text-xl font-semibold mb-1">Admin Sign In</h2>
          <p className="text-gray-600 text-sm">
            Enter your credentials to access the admin dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md transition ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
