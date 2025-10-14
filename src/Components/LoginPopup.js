import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./images/IMG-20251008-WA0008logo0.png";

const LoginPopup = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  // 👇 State for register form
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Handle register input change
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Handle register form submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user: registerData }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Account created successfully!");
        setIsLogin(true); // switch to login panel
      } else {
        alert("❌ " + data.errors.join(", "));
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("❌ Something went wrong.");
    }
  };

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

        {/* Two Panels (Login/Signup) */}
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
              {/* Left Panel */}
              <div className="md:w-1/2 w-full bg-cyan-600 text-white flex flex-col justify-center items-center p-8">
                <img
                  src={logo}
                  alt="SCoast Logo"
                  className="h-8 w-auto object-contain"
                />
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

              {/* Right Form */}
              <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-white p-8">
                <h2 className="text-3xl font-semibold mb-4 text-gray-800">
                  Login
                </h2>
                <form className="w-full max-w-sm space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition"
                  >
                    LOGIN
                  </button>
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
              {/* Register Left Form */}
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
                    placeholder="Name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition"
                  >
                    REGISTER
                  </button>
                </form>
              </div>

              {/* Register Right Panel */}
              <div className="md:w-1/2 w-full bg-cyan-600 text-white flex flex-col justify-center items-center p-8">
                <img
                  src={logo}
                  alt="SCoast Logo"
                  className="h-15 w-auto object-contain"
                />
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
