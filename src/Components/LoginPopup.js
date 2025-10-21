import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./images/IMG-20251008-WA0008logo0.png";
import { jwtDecode } from "jwt-decode";

const LoginPopup = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // ======================== HANDLERS ========================

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const performLogin = async (email, password) => {
    if (!onLoginSuccess) {
      console.error("onLoginSuccess function is not provided to LoginPopup!");
      return false;
    }

    try {
      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // First get response as text to check if it's valid JSON
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      console.log("User login response:", data);

      if (response.ok && data.token) {
        // ✅ Decode the token to get user information
        let decodedToken;
        try {
          decodedToken = jwtDecode(data.token);
          console.log("Decoded token:", decodedToken);
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
        }

        // ✅ Save user data to localStorage in the format expected by BookingSearch
        const userData = {
          token: data.token,
          email: data.email || email,
          name: data.name || data.first_name || registerData.name,
          id: data.user_id || data.id || decodedToken?.user_id || decodedToken?.id,
          ...data // Include any other data from response
        };

        // Store in localStorage (format that BookingSearch expects)
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", data.token); // Backup for compatibility

        // ✅ Update app state and close popup
        onLoginSuccess(userData);

        // ✅ CRITICAL: Dispatch custom event to notify all components
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: userData 
        }));

        // ✅ Also trigger storage event for cross-tab compatibility
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(userData)
        }));

        console.log("Login successful, user data stored:", userData);
        alert("✅ Login successful!");
        
        // Close popup after successful login
        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
        
        return true;
      } else {
        throw new Error(data.error || data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await performLogin(loginData.email, loginData.password);
    } catch (error) {
      // More specific error messages
      if (error.message.includes("Failed to fetch")) {
        alert("❌ Cannot connect to server. Please check your internet connection.");
      } else if (error.message.includes("Server returned an invalid response")) {
        alert("❌ Server error: The backend is not responding properly. Please try again later.");
      } else {
        alert("❌ Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: registerData }),
      });

      // First get response as text to check if it's valid JSON
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText.substring(0, 200));
        throw new Error("Server returned an invalid response during registration.");
      }

      if (response.ok) {
        alert("✅ Account created successfully! Logging you in...");
        
        // ✅ AUTO-LOGIN: Automatically log the user in after successful registration
        try {
          await performLogin(registerData.email, registerData.password);
        } catch (loginError) {
          // If auto-login fails, just show success message and switch to login
          alert("✅ Account created! Please log in with your credentials.");
          setIsLogin(true);
          // Auto-fill login form with registered email
          setLoginData(prev => ({
            ...prev,
            email: registerData.email
          }));
        }
        
        // Clear register form
        setRegisterData({
          name: "",
          email: "",
          phone: "",
          password: "",
        });
      } else {
        alert(`❌ ${data.errors?.join(", ") || data.error || "Registration failed"}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.message.includes("Failed to fetch")) {
        alert("❌ Cannot connect to server. Please check your internet connection.");
      } else if (error.message.includes("Server returned an invalid response")) {
        alert("❌ Server error: The backend is not responding properly. Please try again later.");
      } else {
        alert("❌ Registration failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================== RETURN ========================

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl h-[500px] bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-cyan-900 text-2xl z-20"
        >
          &times;
        </button>

        <AnimatePresence mode="wait">
          {isLogin ? (
            // ====================== LOGIN PANEL ======================
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="flex w-full h-full flex-col md:flex-row"
            >
              <div className="md:w-1/2 w-full bg-cyan-600 text-white flex flex-col justify-center items-center p-8">
                <img src={logo} alt="SCoast Logo" className="h-8 w-auto object-contain" />
                <h2 className="text-3xl font-bold mb-2">New Here?</h2>
                <p className="mb-6 text-center">
                  Create an account to start your journey with us!
                </p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="border border-white px-6 py-2 rounded-full text-white hover:bg-white hover:text-cyan-600 transition"
                >
                  SIGN UP
                </button>
              </div>

              <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-white p-8">
                <h2 className="text-3xl font-semibold mb-4 text-gray-800">Login</h2>
                <form onSubmit={handleLoginSubmit} className="w-full max-w-sm space-y-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-3 rounded-lg transition ${
                      loading
                        ? "bg-cyan-400 cursor-not-allowed"
                        : "bg-cyan-600 hover:bg-cyan-700"
                    }`}
                  >
                    {loading ? "Logging in..." : "LOGIN"}
                  </button>
                  
                  {/* Forgot password link */}
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      className="text-cyan-600 hover:text-cyan-800 text-sm"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            // ====================== REGISTER PANEL ======================
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.4 }}
              className="flex w-full h-full flex-col md:flex-row"
            >
              <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-white p-8">
                <h2 className="text-3xl font-semibold mb-4 text-gray-800">
                  Create Account
                </h2>
                <form
                  onSubmit={handleRegisterSubmit}
                  className="w-full max-w-sm space-y-4"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    required
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-3 rounded-lg transition ${
                      loading
                        ? "bg-cyan-400 cursor-not-allowed"
                        : "bg-cyan-600 hover:bg-cyan-700"
                    }`}
                  >
                    {loading ? "Registering..." : "CREATE ACCOUNT"}
                  </button>
                </form>
              </div>

              <div className="md:w-1/2 w-full bg-cyan-600 text-white flex flex-col justify-center items-center p-8">
                <img src={logo} alt="SCoast Logo" className="h-15 w-auto object-contain" />
                <h2 className="text-3xl font-bold mb-2">Already a Member?</h2>
                <p className="mb-6 text-center">
                  Sign in to access your account and continue.
                </p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="border border-white px-6 py-2 rounded-full text-white hover:bg-white hover:text-cyan-400 transition"
                >
                  LOGIN
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPopup;