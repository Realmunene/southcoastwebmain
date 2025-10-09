import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function WhatsAppChat() {
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce">
      <a
        href="https://wa.me/+254729491343"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition duration-300 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
      </a>
    </div>
  );
}
