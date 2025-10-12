import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./images/IMG-20251008-WA0008logo0.png";
import {
  faHouse,
  faUmbrellaBeach,
  faGlobe,
  faHandshake,
  faUser,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onLoginClick, onPartnerClick, setActiveSection }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    // Reset active section and go to home
    setActiveSection("home");
    setShowMenu(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sticky top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* LEFT SECTION */}
        <div className="flex items-center space-x-4">
          {/* ✅ Logo Link to Home */}
          <Link
          to='/'
            className="flex items-center space-x-1 focus:outline-none"
          >
            <img
              src={logo}
              alt="SCoast Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-bold text-gray-800">
              SouthCoast
            </span>
          </Link>
        </div>

        {/* RIGHT SECTION - DESKTOP */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Book a Stay */}
          <button
            onClick={handleHomeClick}
            className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
          >
            <FontAwesomeIcon icon={faHouse} className="text-lg" />
            <span className="text-sm font-medium">Book a Stay</span>
          </button>

          <span className="text-gray-300 text-xl">|</span>

          {/* Experiences */}
          <button
            onClick={handleHomeClick}
            className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
          >
            <FontAwesomeIcon icon={faUmbrellaBeach} className="text-lg" />
            <span className="text-sm font-medium">Experiences</span>
          </button>

          <span className="text-gray-300 text-xl">|</span>

          {/* Currency */}
          <button className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition">
            <FontAwesomeIcon icon={faGlobe} className="text-lg" />
            <span className="text-sm font-medium">USD</span>
            <span className="text-xs">▼</span>
          </button>

          <span className="text-gray-300 text-xl">|</span>

          {/* Partner With Us */}
          <Link
            to="/partnership"
            onClick={() => setShowMenu(false)}
            className="px-3 py-2 text-sm font-medium text-gray-700 border rounded-full hover:bg-coral-500 hover:text-black transition flex items-center"
          >
            <FontAwesomeIcon icon={faHandshake} className="mr-1" />
            Partner With Us
          </Link>

          {/* Log In / Sign Up */}
          <button
            onClick={onLoginClick}
            type="button"
            className="px-4 py-2 bg-coral-500 text-black text-sm font-medium rounded-full hover:bg-coral-600 transition"
          >
            <FontAwesomeIcon icon={faUser} className="mr-1" />
            Log In / Sign Up
          </button>
        </div>

        {/* HAMBURGER MENU - MOBILE */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          <FontAwesomeIcon icon={showMenu ? faXmark : faBars} size="lg" />
        </button>
      </div>

      {/* MOBILE MENU CONTENT */}
      {showMenu && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="flex flex-col p-4 space-y-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition"
            >
              <FontAwesomeIcon icon={faHouse} />
              <span>Book a Stay</span>
            </button>

            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition"
            >
              <FontAwesomeIcon icon={faUmbrellaBeach} />
              <span>Experiences</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition">
              <FontAwesomeIcon icon={faGlobe} />
              <span>USD ▼</span>
            </button>

            <Link
              to="/partnership"
              onClick={() => setShowMenu(false)}
              className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition"
            >
              <FontAwesomeIcon icon={faHandshake} />
              <span>Partner With Us</span>
            </Link>

            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-coral-500 text-black text-sm font-medium rounded-full hover:bg-coral-600 transition"
            >
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              Log In / Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
