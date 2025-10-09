import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Footer from './Components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faXTwitter, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { faHouse, faUmbrellaBeach, faGlobe, faHandshake, faUser, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Home from './Components/Home';
import Gallery from './Components/Gallery';
import Package from './Components/Package';
import React, { useState } from "react";
// import PartnerRegistrationForm from './Components/PartnerRegistrationForm';


function App() {
  // ✅ Function to smoothly scroll to section by ID
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [showPartnerForm, setShowPartnerForm] = useState(false);

  return (
    <Router>
      <div className="App">

        {/* 🟢 TOP CONTACT & SOCIAL BAR */}
        <div className="sticky top-0 left-0 w-full bg-cyan-500 py-2 px-4 flex flex-wrap items-center justify-between shadow-md z-50">
          {/* LEFT: CONTACTS */}
          <div className="flex items-center space-x-6">
            <a
              href="tel:+254729491343"
              className="flex items-center space-x-2 hover:text-grey-400 transition"
            >
              <FontAwesomeIcon icon={faPhone} className="text-grey-500 h-4 w-4" />
              <span>+254 729 491 343</span>
            </a>

            <a
              href="mailto:southcoastoutdoors25@gmail.com"
              className="flex items-center space-x-2 hover:text-grey-400 transition"
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-grey-500 h-4 w-4" />
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

        {/* 🟠 MAIN NAVIGATION BAR */}
        <div className="sticky top-0 left-0 w-full bg-white shadow-md z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            {/* LEFT SECTION */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Link to="/home" className="flex items-center space-x-1">
                <img
                  src="/images/IMG-20251008-WA0008logo0.png"
                  alt="SouthCoast Logo"
                  className="h-8 w-auto object-contain"
                />
                <span className="text-xl font-bold text-gray-800">SouthCoast</span>
              </Link>

              <span className="text-gray-300 text-xl">|</span>

              {/* ✅ Scroll to Book a Stay */}
              <button
                onClick={() => scrollToSection('package')}
                className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
              >
                <FontAwesomeIcon icon={faHouse} className="text-lg" />
                <span className="text-sm font-medium">Book a Stay</span>
              </button>

              <span className="text-gray-300 text-xl">|</span>

              {/* ✅ Scroll to Experiences */}
              <button
                onClick={() => scrollToSection('gallery')}
                className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
              >
                <FontAwesomeIcon icon={faUmbrellaBeach} className="text-lg" />
                <span className="text-sm font-medium">Experiences</span>
              </button>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center space-x-4">
              {/* Currency */}
              <button className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition">
                <FontAwesomeIcon icon={faGlobe} className="text-lg" />
                <span className="text-sm font-medium">USD</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Partner With Us */}
              <button
                  onClick={() => setShowPartnerForm(true)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 border rounded-full hover:bg-coral-500 hover:text-black transition flex items-center"
              >
                    <FontAwesomeIcon icon={faHandshake} className="mr-1" />
                    Partner With Us
                    </button>
                    {/* Fullscreen Partner Form */}
                          {showPartnerForm && (
                            <div className="fixed inset-0 bg-white z-[9999] overflow-auto">
                              <div className="flex justify-end p-4">
                                <button
                                  // onClick={() => setShowPartnerForm(false)}
                                  className="text-gray-700 hover:text-red-600 font-bold text-xl"
                                >
                                  x
                                </button>
                              </div>
                              {/* <PartnerRegistrationForm /> */}
                            </div>
                            )}

              {/* Log In / Sign Up */}
              <button type='text' className="px-4 py-2 bg-coral-500 text-black text-sm font-medium rounded-full hover:bg-coral-600 transition"
              >
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                Log In / Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* 🏡 CONTENT SECTIONS WITH IDS */}
        <div id="home">
          <Home />
        </div>
        <div id="package">
          <Package />
        </div>
         <div id="gallery">
          <Gallery />
        </div>

        <Footer />
      </div>

      <main className="main-content">
        <Routes>
         
          <Route path="/package"  element={<Package />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>
    </Router>
    
  );
}

export default App;
