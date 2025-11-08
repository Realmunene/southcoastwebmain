import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import logo from "./images/IMG-20251008-WA0008logo0.png";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);

  // Optional: auto-show after 2.5s delay
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Floating Bouncing WhatsApp Button */}
      {!open && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <button
            onClick={() => setOpen(true)}
            className="bg-green-500 hover:bg-green-400 text-white rounded-full p-4 shadow-lg transition duration-300 flex items-center justify-center"
            aria-label="Chat on WhatsApp"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
          </button>
        </div>
      )}

      {/* Popup Chat Card */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between bg-cyan-700 text-white px-4 py-3">
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="South Coast Web"
                className="w-8 h-8 rounded-full border border-white"
              />
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  SouthCoast Outdoors
                </h3>
                <p className="text-xs text-green-100">Replies within an hour</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200 transition"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Message Bubble */}
          <div className="bg-gray-50 px-4 py-3">
            <div className="bg-white border rounded-lg p-3 shadow-sm max-w-[85%]">
              <p className="text-sm text-gray-800">
                Hi! 👋 Welcome to SouthCoast Outdoors.
                How can we assist you today?
              </p>
              <p className="text-xs text-gray-400 mt-1 text-right">8:13</p>
            </div>
          </div>

          {/* Footer Message */}
          <div className="px-4 text-center text-xs text-gray-400">
            We have opened WhatsApp for you
          </div>

          {/* Start Chat Button */}
          <div className="p-3">
            <a
              href="https://wa.me/+254729491343"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-400 hover:bg-green-700 text-white font-medium w-full rounded-lg py-2 flex items-center justify-center space-x-2 transition"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
              <span>Start chat</span>
            </a>
          </div>

          {/* Footer Credit */}
          <div className="text-[10px] text-center text-gray-300 pb-2">
            Powered by <span className="text-cyan-600 font-semibold">SouthCoast Outdoors</span>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
