import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faXmark, 
  faBuilding, 
  faUser, 
  faPhone, 
  faEnvelope, 
  faLock, 
  faMapMarkerAlt,
  faFileAlt,
  faCity,
  faHome,
  faArrowRight,
  faArrowLeft,
  faHandshake
} from "@fortawesome/free-solid-svg-icons";
import logo from "./images/IMG-20251008-WA0008logo0.png";

export default function PartnerRegistrationForm({ onClose }) {
  const [form, setForm] = useState({
    supplierType: "",
    supplierName: "",
    mobile: "",
    email: "",
    contactPerson: "",
    password: "",
    confirmPassword: "",
    description: "",
    city: "",
    address: "",
    agree: false,
  });

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!form.agree) {
      alert("Please accept the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      // Map camelCase → snake_case for Rails backend
      const payload = {
        supplier_type: form.supplierType,
        supplier_name: form.supplierName,
        mobile: form.mobile,
        email: form.email,
        contact_person: form.contactPerson,
        password: form.password,
        description: form.description,
        city: form.city,
        address: form.address,
      };

      const res = await fetch("http://127.0.0.1:3000/api/v1/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner: payload }),
      });

      // First get response as text to check if it's valid JSON
      const responseText = await res.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      console.log("Registration response:", data);

      if (data.status === "success" || res.ok) {
        if (data.token) {
          localStorage.setItem("partnerToken", data.token);
        }
        
        // Show custom success message
        alert("Registration successful! Our support team will reach out to you shortly.");
        
        // Safe onClose call
        if (typeof onClose === 'function') {
          onClose();
        } else {
          console.log('Registration successful - onClose not available');
          // Reset form on success
          setForm({
            supplierType: "",
            supplierName: "",
            mobile: "",
            email: "",
            contactPerson: "",
            password: "",
            confirmPassword: "",
            description: "",
            city: "",
            address: "",
            agree: false,
          });
        }
      } else {
        alert(data.errors ? data.errors.join(", ") : data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check your internet connection.");
      } else if (err.message.includes("Server returned an invalid response")) {
        alert("Server error: The backend is not responding properly. Please try again later.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:3000/api/v1/partners/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      // First get response as text to check if it's valid JSON
      const responseText = await res.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      if (data.status === "success" || res.ok) {
        if (data.token) {
          localStorage.setItem("partnerToken", data.token);
        }
        alert("Login successful!");
        setShowLogin(false);
        
        // Safe onClose call
        if (typeof onClose === 'function') {
          onClose();
        } else {
          console.log('Login successful - onClose not available');
          setLoginForm({ email: "", password: "" });
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check your internet connection.");
      } else if (err.message.includes("Server returned an invalid response")) {
        alert("Server error: The backend is not responding properly. Please try again later.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.log('Close functionality not available');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="SouthCoast Logo" className="h-12 w-auto drop-shadow-lg" />
                <div>
                  <h1 className="text-3xl font-bold">SouthCoast</h1>
                  <p className="text-cyan-100">Partner Portal</p>
                </div>
              </div>
              
              {/* Close button - only show if onClose is provided */}
              {typeof onClose === 'function' && (
                <button
                  onClick={handleClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-white text-lg" />
                </button>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <div className="w-16 h-1 bg-cyan-300 rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Partner Registration</h2>
              <p className="text-cyan-100">
                Join our network of trusted service providers
              </p>
              <div className="mt-2 px-4 py-1 bg-amber-500/20 rounded-full inline-block">
                <p className="text-amber-200 text-sm font-medium">
                  This section is for service providers only
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faBuilding} className="text-cyan-600 text-sm" />
                  Supplier Type
                </label>
                <div className="relative">
                  <select
                    name="supplierType"
                    value={form.supplierType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="">Select supplier type</option>
                    <option value="accommodation">Accommodation Provider</option>
                    <option value="transport">Transport Provider</option>
                    <option value="tour">Tour Operator</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Supplier Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faBuilding} className="text-cyan-600 text-sm" />
                  Business Name
                </label>
                <div className="relative">
                  <input
                    name="supplierName"
                    placeholder="Enter your business name"
                    value={form.supplierName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faPhone} className="text-cyan-600 text-sm" />
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    name="mobile"
                    placeholder="+254 712 345 678"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    placeholder="business@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faUser} className="text-cyan-600 text-sm" />
                  Contact Person
                </label>
                <div className="relative">
                  <input
                    name="contactPerson"
                    placeholder="Full name of contact person"
                    value={form.contactPerson}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faLock} className="text-cyan-600 text-sm" />
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                    minLength="6"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faLock} className="text-cyan-600 text-sm" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                    minLength="6"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faFileAlt} className="text-cyan-600 text-sm" />
                  Business Description
                </label>
                <div className="relative">
                  <input
                    name="description"
                    placeholder="Describe your business services"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faCity} className="text-cyan-600 text-sm" />
                  City
                </label>
                <div className="relative">
                  <input
                    name="city"
                    placeholder="Enter your city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faCity} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-cyan-600 text-sm" />
                  Business Address
                </label>
                <div className="relative">
                  <input
                    name="address"
                    placeholder="Enter your complete business address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="md:col-span-2 flex items-start space-x-3 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded mt-1"
                  required
                />
                <label className="text-sm text-gray-700">
                  I accept the{" "}
                  <a href="#" className="text-cyan-600 hover:text-cyan-700 font-semibold underline">
                    Terms and Conditions
                  </a>{" "}
                  and agree to the processing of my personal data
                </label>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 text-center mt-6 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-12 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 mx-auto ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Registration...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faHandshake} className="text-white" />
                      <span>Become a Partner</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-gray-600">
                    Already have a partner account?{" "}
                    <button
                      type="button"
                      onClick={() => setShowLogin(true)}
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline transition-colors flex items-center gap-2 mx-auto"
                    >
                      <span>Sign In to Partner Portal</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            {/* Login Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faHandshake} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Partner Login</h2>
                    <p className="text-cyan-100 text-sm">Access your partner account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogin(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-white text-sm" />
                </button>
              </div>
            </div>

            {/* Login Form */}
            <div className="p-6">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      placeholder="partner@example.com"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      required
                      disabled={loginLoading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FontAwesomeIcon icon={faLock} className="text-cyan-600 text-sm" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      required
                      disabled={loginLoading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                    loginLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loginLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faArrowRight} className="text-white" />
                      <span>Sign In to Partner Portal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-3">
                <button
                  type="button"
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
                >
                  Forgot your password?
                </button>
                
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-600 text-sm">
                    Not a partner yet?{" "}
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline transition-colors"
                    >
                      Join our network
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}