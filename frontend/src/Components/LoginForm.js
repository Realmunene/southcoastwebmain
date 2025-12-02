import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faLock, faShield, faUserShield, faArrowLeft, faKey, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import logo from "./images/IMG-20251008-WA0008logo0.png";

const LoginForm = ({ onAdminLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [view, setView] = useState("login"); // 'login' or 'forgot'
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const navigate = useNavigate();

  // Check for existing session on component mount - BUT only if user explicitly chooses "Remember Me"
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        // First, check if user has recently logged out
        const logoutTimestamp = localStorage.getItem("adminLastLogout");
        const now = new Date().getTime();
        
        // If user logged out within the last 5 minutes, don't auto-login
        if (logoutTimestamp && (now - parseInt(logoutTimestamp) < 5 * 60 * 1000)) {
          // Don't auto-login after recent logout
          localStorage.removeItem("adminLastLogout");
          return;
        }

        // Check if we have a session token with expiry
        const sessionData = localStorage.getItem("adminSessionData");
        
        if (sessionData) {
          const parsedData = JSON.parse(sessionData);
          const now = new Date().getTime();
          
          // Check if session is still valid (within 12 hours)
          if (parsedData.expiry && now < parsedData.expiry) {
            // Auto-fill email from remembered session but DON'T auto-login
            setEmail(parsedData.email || "");
            setRememberMe(true);
            
            // Just set the form values, don't auto-navigate
            // The user must click the login button
          } else {
            // Session expired, clear it
            localStorage.removeItem("adminSessionData");
          }
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
        // Clear any corrupted data
        localStorage.removeItem("adminSessionData");
      }
    };

    checkExistingSession();
  }, [navigate, onAdminLogin]);

  const clearSessionData = () => {
    localStorage.removeItem("adminSessionData");
    localStorage.removeItem("adminLastLogout");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("https://southcoastoutdoors.cloud/api/v1/admin/login", {
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

        // Store admin data in localStorage (always for current session)
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminEmail", admin.email);
        localStorage.setItem("adminRole", admin.role || "admin");
        localStorage.setItem("adminName", admin.name || admin.email.split('@')[0]);

        // If "Remember Me" is checked, store session data with expiry
        if (rememberMe) {
          const now = new Date().getTime();
          const twelveHoursInMs = 12 * 60 * 60 * 1000;
          const expiryTime = now + twelveHoursInMs;
          
          const sessionData = {
            token,
            email: admin.email,
            role: admin.role || "admin",
            name: admin.name || admin.email.split('@')[0],
            expiry: expiryTime,
            timestamp: now
          };
          
          localStorage.setItem("adminSessionData", JSON.stringify(sessionData));
        } else {
          // Clear any existing session data if "Remember Me" is not checked
          clearSessionData();
        }
        
        // Clear any logout timestamp
        localStorage.removeItem("adminLastLogout");

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

  // Function to clear session (for logout) - This should be called from admin dashboard
  const handleLogout = () => {
    // Set logout timestamp to prevent immediate auto-login
    const now = new Date().getTime();
    localStorage.setItem("adminLastLogout", now.toString());
    
    // Clear all admin data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminSessionData");
    
    // Navigate to login page
    navigate("/admin/login");
  };

  // Function that can be called from parent components (like dashboard) to logout
  useEffect(() => {
    // Expose logout function to parent via callback
    if (onAdminLogin) {
      // You might want to pass this function differently based on your app structure
      // For now, we'll attach it to window (not ideal, but works)
      window.adminLogout = handleLogout;
    }
    
    return () => {
      // Cleanup
      delete window.adminLogout;
    };
  }, [navigate]);

  const handleForgotPassword = () => {
    setView("forgot");
  };

  const handleBackToLogin = () => {
    setView("login");
    setRecoverySent(false);
    setRecoveryEmail("");
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);

    try {
      const response = await fetch("https://southcoastoutdoors.cloud/api/v1/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      if (response.ok) {
        setRecoverySent(true);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to send recovery email.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Login Form View
  const renderLoginForm = () => (
    <>
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
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me (Stay logged in for 12 hours)
            </label>
          </div>
          <button
            type="button"
            onClick={handleForgotPassword}
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
            <p className="text-sm font-semibold text-cyan-800">Session Information</p>
            <p className="text-xs text-cyan-600 mt-1">
              {rememberMe 
                ? "Your session will be remembered for 12 hours. Uncheck 'Remember me' for a single session." 
                : "Your session will expire when you close the browser. Check 'Remember me' to stay logged in for 12 hours."}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Forgot Password View
  const renderForgotPasswordForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faKey} className="text-cyan-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Recovery</h2>
        <p className="text-gray-600">
          Enter the email address associated with your admin account
        </p>
      </div>

      {recoverySent ? (
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
        <form onSubmit={handleRecoverySubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="recoveryEmail" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="recoveryEmail"
                placeholder="admin@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                required
                disabled={recoveryLoading}
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
              disabled={recoveryLoading}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            
            <button
              type="submit"
              disabled={recoveryLoading}
              className={`flex-1 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                recoveryLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {recoveryLoading ? (
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
      <div className="mt-8 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faUserShield} className="text-cyan-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cyan-800">Secure Password Recovery</p>
            <p className="text-xs text-cyan-600 mt-1">
              For security reasons, password reset links are valid for 1 hour and can only be used once.
              Contact your system administrator if you need assistance.
            </p>
          </div>
        </div>
      </div>
    </>
  );

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
          {view === "login" ? renderLoginForm() : renderForgotPasswordForm()}
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