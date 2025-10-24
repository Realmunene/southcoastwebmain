import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Footer.css";

export default function InstantMessage({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Email reputation check (NO KEY)
  const checkEmailReputation = async (email) => {
    const API_URL = "https://emailreputation.abstractapi.com/v1?email=joseph.m.munene690@gmail.com"; // GET URL here

    try {
      const response = await fetch(`${API_URL}?email=${email}`);
      const data = await response.json();

      console.log("Email reputation result:", data);

      // MUST be deliverable
      if (data.email_deliverability.status !== "deliverable") return false;

      // SMTP & MX must be valid
      if (!data.email_deliverability.is_smtp_valid) return false;
      if (!data.email_deliverability.is_mx_valid) return false;

      // Block fake/temporary email
      if (data.email_quality.is_disposable) return false;

      // Format must look correct
      if (!data.email_deliverability.is_format_valid) return false;

      return true;
    } catch (err) {
      console.error("Email reputation error:", err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ validate email reputation first
    const isReal = await checkEmailReputation(email);

    if (!isReal) {
      alert("❌ The email you entered is not valid or not deliverable.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://backend-southcoastwebmain-1.onrender.com/api/v1/contact_messages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact_message: {
              email,
              message,
            },
          }),
        }
      );

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
        alert(`❌ Error: ${data.errors?.join(", ") || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("⚠️ Could not send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-xl border border-gray-200 rounded-xl w-80 z-50 p-4 animate-slide-up">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-700">Contact Support</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 transition"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Your real email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows="3"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className={`bg-cyan-500 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
