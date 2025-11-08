import "./Footer.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPaperPlane, faEnvelope, faComment } from "@fortawesome/free-solid-svg-icons";

export default function InstantMessage({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic email syntax check before sending to backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("❌ Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/contact_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_message: { email, message },
        }),
      });

      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("Response is not JSON:", text);
      }

      if (response.ok) {
        alert("✅ Message sent successfully!");
        setEmail("");
        setMessage("");
        onClose();
      } else {
        alert(`❌ ${data.errors?.join(", ") || "Please enter a real, deliverable email."}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("⚠️ Could not send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 z-50 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faComment} className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Contact Support</h2>
              <p className="text-cyan-100 text-sm">We're here to help!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-sm" />
            Email Address
          </label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
            disabled={loading}
          />
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FontAwesomeIcon icon={faComment} className="text-cyan-600 text-sm" />
            Your Message
          </label>
          <textarea
            placeholder="Tell us how we can help you today..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows="4"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 resize-none bg-gray-50 hover:bg-white"
            disabled={loading}
          ></textarea>
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
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="text-white" />
              <span>Send Message</span>
            </>
          )}
        </button>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            We typically respond within <span className="font-semibold text-cyan-600">2 minutes</span>
          </p>
        </div>
      </form>

      {/* Decorative Footer */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
    </div>
  );
}