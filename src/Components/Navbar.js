import React, { useState } from "react";
import { Link } from "react-router-dom";
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



export default function Navbar({onLoginClick, onPartnerClick, setActiveSection}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setShowMenu(false); // close menu after clicking
  };
const [showModal, setShowModal] = useState(false);
  return (
    <div className="sticky top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* LEFT SECTION */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-1">
            <img
            src={logo}
              alt="SCoast Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-bold text-gray-800">SouthCoast</span>
          </Link> 
        </div>

        {/* RIGHT SECTION - DESKTOP */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-gray-300 text-xl">|</span>
           {/* Book a Stay */}
          <button
            onClick={() => scrollToSection("package")}
            className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
          >
            <FontAwesomeIcon icon={faHouse} className="text-lg" />
            <span className="text-sm font-medium">Book a Stay</span>
          </button>

          <span className="text-gray-300 text-xl">|</span>

          {/* Experiences */}
          <button
            onClick={() => scrollToSection("gallery")}
            className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
          >
            <FontAwesomeIcon icon={faUmbrellaBeach} className="text-lg" />
            <span className="text-sm font-medium">Experiences</span>
          </button>
                  {/* Currency */}
          <button className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition">
            <FontAwesomeIcon icon={faGlobe} className="text-lg" />
            <span className="text-sm font-medium">USD</span>
            <span className="text-xs">▼</span>
          </button>

          {/* Partner With Us */}
          <button
            onClick={onPartnerClick}
            className="px-3 py-2 text-sm font-medium text-gray-700 border rounded-full hover:bg-coral-500 hover:text-black transition flex items-center"
          >
            <FontAwesomeIcon icon={faHandshake} className="mr-1" />
            Partner With Us
          </button>

          {/* Log In / Sign Up */}
          <button
          onClick={onLoginClick}
            type="text"
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
              onClick={() => scrollToSection("package")}
              className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition"
            >
              <FontAwesomeIcon icon={faHouse} />
              <span>Book a Stay</span>
            </button>

            <button
              onClick={() => scrollToSection("gallery")}
              className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition"
            >
              <FontAwesomeIcon icon={faUmbrellaBeach} />
              <span>Experiences</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition">
              <FontAwesomeIcon icon={faGlobe} />
              <span>USD ▼</span>
            </button>

            <button
              onClick={onPartnerClick
        }
            className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition"
            >
              <FontAwesomeIcon icon={faHandshake} />
              <span>Partner With Us</span>
            </button>

            <button
        type="button"
        onClick= {onLoginClick}
        className="px-4 py-2 bg-cyan-400 text-black text-sm font-medium rounded-full hover:bg-[#ff9466] transition"
      >
        <FontAwesomeIcon icon={faUser} className="mr-1" />
        Log In / Sign Up
      </button>
          </div>
        </div>
      )}

      {/* Partner With Us Modal */}
      {showPartnerForm && (
        <div className="fixed inset-0 bg-white z-[9999] overflow-auto">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setShowPartnerForm(false)}
              className="text-gray-700 hover:text-red-600 font-bold text-xl"
            >
              x
            </button>
          </div>
          {/* <PartnerRegistrationForm /> */}
        </div>
      )}
    </div>
  );
}
