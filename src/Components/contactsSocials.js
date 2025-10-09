import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faXTwitter, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { faHouse, faUmbrellaBeach, faGlobe, faHandshake, faUser, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
const contactsSocials = () => {
  return (
     <div className="w-full bg-gray-900 text-white text-sm py-2 px-4 flex flex-wrap items-center justify-between">
          {/* LEFT: CONTACTS */}
          <div className="flex items-center space-x-6">
            <a
              href="tel:+254729491343"
              className="flex items-center space-x-2 hover:text-red-400 transition"
            >
              <FontAwesomeIcon icon={faPhone} className="text-red-500 h-4 w-4" />
              <span>+254 729 491 343</span>
            </a>

            <a
              href="mailto:southcoastoutdoors25@gmail.com"
              className="flex items-center space-x-2 hover:text-red-400 transition"
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-red-500 h-4 w-4" />
              <span>southcoastoutdoors25@gmail.com</span>
            </a>
          </div>

          {/* RIGHT: SOCIAL ICONS */}
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition">
              <FontAwesomeIcon icon={faFacebookF} className="text-lg" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition">
              <FontAwesomeIcon icon={faInstagram} className="text-lg" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition">
              <FontAwesomeIcon icon={faXTwitter} className="text-lg" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition">
              <FontAwesomeIcon icon={faTiktok} className="text-lg" />
            </a>
          </div>
        </div>
  )
}

export default contactsSocials
