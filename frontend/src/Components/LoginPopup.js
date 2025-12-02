import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faLock, 
  faUser, 
  faPhone, 
  faXmark,
  faArrowRight,
  faArrowLeft,
  faShield,
  faKey,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import logo from "./images/IMG-20251008-WA0008logo0.png";
import { jwtDecode } from "jwt-decode";

const LoginPopup = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginView, setLoginView] = useState("login"); // 'login' or 'forgot'
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

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
      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error("onLoginSuccess function is not provided to LoginPopup!");
      }
      return false;
    }

    try {
      const response = await fetch("https://southcoastoutdoors.cloud/api/v1/user/login", {
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
        // Log error only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("JSON Parse Error:", parseError);
        }
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      if (response.ok && data.token) {
        // ✅ Decode the token to get user information
        let decodedToken;
        try {
          decodedToken = jwtDecode(data.token);
          // REMOVED: Sensitive token logging
        } catch (decodeError) {
          // Log error only in development
          if (process.env.NODE_ENV === 'development') {
            console.error("Error decoding token:", decodeError);
          }
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

        // REMOVED: Sensitive user data logging
        
        // Close popup after successful login
        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
        
        return true;
      } else {
        throw new Error(data.error || data.message || "Invalid email or password");
      }
    } catch (error) {
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Login error:", error);
      }
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

  const handleForgotPassword = () => {
    setLoginView("forgot");
  };

  const handleBackToLogin = () => {
    setLoginView("login");
    setForgotSent(false);
    setForgotEmail("");
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      // Real API call for user password recovery
      const response = await fetch("https://southcoastoutdoors.cloud/api/v1/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setForgotSent(true);
      } else {
        alert(data.message || "Failed to send recovery email. Please try again.");
      }
    } catch (error) {
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Forgot password error:", error);
      }
      alert("An error occurred. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://southcoastoutdoors.cloud/api/v1/users", {
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
        // Log error only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("JSON Parse Error:", parseError);
        }
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
          setLoginView("login");
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
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Registration error:", error);
      }
      
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

  // ======================== RENDER FUNCTIONS ========================

  const renderLoginForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faShield} className="text-cyan-600 text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">
          Sign in to your SouthCoast account
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={loginData.email}
              onChange={handleLoginChange}
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
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FontAwesomeIcon icon={faLock} className="text-cyan-600 text-sm" />
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
              required
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button 
            type="button" 
            onClick={handleForgotPassword}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
            disabled={loading}
          >
            Forgot your password?
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
              <FontAwesomeIcon icon={faArrowRight} className="text-white" />
              <span>Sign In to Account</span>
            </>
          )}
        </button>
      </form>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faKey} className="text-cyan-600 text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Recovery</h2>
        <p className="text-gray-600">
          Enter your email to reset your password
        </p>
      </div>

      {forgotSent ? (
        // SUCCESS VIEW - Check your email
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-3xl" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h3>
          
          <div className="text-left bg-gray-50 p-6 rounded-xl border border-gray-200">
            <p className="text-gray-700 mb-4">
              We've sent you an email with instructions to reset your password. 
              Check your inbox and follow the steps there.
            </p>
            
            <p className="text-sm text-gray-600">
              If you didn't request a password change or would like to log in to a different account, 
              select <span className="font-medium">"Return to login"</span>.
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
            <span>Return to login</span>
          </button>
        </div>
      ) : (
        // FORGOT PASSWORD FORM VIEW
        <form onSubmit={handleForgotSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                required
                disabled={forgotLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We'll send password reset instructions to this email
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
              disabled={forgotLoading}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            
            <button
              type="submit"
              disabled={forgotLoading}
              className={`flex-1 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                forgotLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {forgotLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faKey} className="text-white" />
                  <span>Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Security Notice for Recovery */}
      <div className="mt-6 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faShield} className="text-cyan-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cyan-800">Secure Password Recovery</p>
            <p className="text-xs text-cyan-600 mt-1">
              Password reset links are valid for 1 hour. Check your spam folder if you don't see the email.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // ======================== RETURN ========================

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 z-20 hover:scale-110"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xl" />
        </button>

        <AnimatePresence mode="wait">
          {isLogin ? (
            // ====================== LOGIN PANEL ======================
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="flex w-full min-h-[600px]"
            >
              {/* Login Form Side */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-12">
                <div className="w-full max-w-md">
                  <AnimatePresence mode="wait">
                    {loginView === "login" ? (
                      <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderLoginForm()}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="forgot-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderForgotPasswordForm()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Welcome Side (Unchanged) */}
              <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 to-cyan-800 text-white flex-col justify-center items-center p-12 relative">
                <div className="text-center">
                  <img src={logo} alt="SCoast Logo" className="h-16 w-auto mx-auto mb-6 drop-shadow-lg" />
                  <h3 className="text-4xl font-bold mb-4">New Here?</h3>
                  <p className="text-cyan-100 text-lg mb-8 max-w-md">
                    Create an account to unlock exclusive features and start your journey with SouthCoast!
                  </p>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-cyan-700 transition-all duration-300 font-semibold flex items-center gap-3 group"
                  >
                    <span>Create Account</span>
                    <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-8 left-8 text-cyan-200 text-sm">
                  Secure & Encrypted
                </div>
              </div>
            </motion.div>
          ) : (
            // ====================== REGISTER PANEL (Unchanged) ======================
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
              className="flex w-full min-h-[600px]"
            >
              {/* Welcome Side */}
              <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 to-cyan-800 text-white flex-col justify-center items-center p-12 relative">
                <div className="text-center">
                  <img src={logo} alt="SCoast Logo" className="h-16 w-auto mx-auto mb-6 drop-shadow-lg" />
                  <h3 className="text-4xl font-bold mb-4">Welcome Back!</h3>
                  <p className="text-cyan-100 text-lg mb-8 max-w-md">
                    Already have an account? Sign in to continue your journey with SouthCoast.
                  </p>
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setLoginView("login");
                    }}
                    className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-cyan-700 transition-all duration-300 font-semibold flex items-center gap-3 group"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Sign In</span>
                  </button>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-8 left-8 text-cyan-200 text-sm">
                  Join Our Community
                </div>
              </div>

              {/* Register Form Side */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-12">
                <div className="w-full max-w-md">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faUser} className="text-cyan-600 text-2xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-600">
                      Join SouthCoast and start your adventure
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FontAwesomeIcon icon={faUser} className="text-cyan-600 text-sm" />
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          placeholder="Joseph Frank"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                          required
                          disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          placeholder="your.email@example.com"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                          required
                          disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FontAwesomeIcon icon={faPhone} className="text-cyan-600 text-sm" />
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="phone"
                          placeholder="+254 700 000 000"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                          required
                          disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FontAwesomeIcon icon={faLock} className="text-cyan-600 text-sm" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="password"
                          placeholder="Create a strong password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                          required
                          disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                        </div>
                      </div>
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
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faUser} className="text-white" />
                          <span>Create My Account</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPopup;