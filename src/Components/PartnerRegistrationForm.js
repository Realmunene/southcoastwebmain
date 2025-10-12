import React, { useState } from "react";
import logo from "./images/IMG-20251008-WA0008logo0.png";
export default function PartnerRegistrationForm({onClose}) {
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

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [showLogin, setShowLogin] = useState(false);

  // Handle Registration Form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration Data:", form);
  };

  // Handle Login Form
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", loginForm);
    // close modal after login
    setShowLogin(false);
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-cyan-400 to-cyan-800 p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img src={logo} alt="Southcoast logo" className="mx-auto mb-2 w-40" />
            <p className="text-gray-700 font-semibold">Free Sign Up</p>
            <h2 className="text-2xl font-bold mb-1">Partner Registration</h2>
            <p className="text-red-500 text-sm">This section is for service providers only</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Type</label>
              <select
                name="supplierType"
                value={form.supplierType}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              >
                <option value="">Select supplier type</option>
                <option value="accommodation">Accommodation Provider</option>
                <option value="transport">Transport Provider</option>
                <option value="tour">Tour Operator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Supplier Name</label>
              <input
                name="supplierName"
                placeholder="Enter your business name"
                value={form.supplierName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input
                name="mobile"
                placeholder="+254712345678"
                value={form.mobile}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email address</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Person</label>
              <input
                name="contactPerson"
                placeholder="Enter your name"
                value={form.contactPerson}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                name="description"
                placeholder="Describe your business"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                name="city"
                placeholder="Enter your city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                name="address"
                placeholder="Enter your address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="md:col-span-2 flex items-center mt-2">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="h-4 w-4"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I accept{" "}
                <a href="#" className="text-blue-600 underline">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div className="md:col-span-2 text-center mt-4">
              <button
                type="submit"
                className="w-32 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg"
              >
                Sign Up
              </button>
              <p className="mt-3 text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className="text-cyan-600 font-semibold underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center text-cyan-700">Partner Login</h2>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
              >
                Log In
              </button>
            </form>

            <p className="mt-3 text-sm text-center">
              Forgot your password?{" "}
              <a href="#" className="text-blue-600 font-semibold underline">
                Reset
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
