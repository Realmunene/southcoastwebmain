import React from "react";

const Footer = () => {
  return (
    <footer className="bg-cyan-800 text-white py-10 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-justify">
        {/* Logo and Contact */}
        <div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-5">
                <img
            src="/images/IMG-20251008-WA0008logo0.png"
            alt="ViuTravel Logo"
            className="h-12 mb-4" />
            <button className="border border-white px-4 py-2 mb-5 hover:bg-white hover:text-black transition">
            Contact Us
            </button>
          </div>
          <div className="flex space-x-4 mb-4">
            <a href="#" aria-label="Facebook" className="hover:text-cyan-500">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-cyan-500">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-cyan-500">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-cyan-500">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>

          <p className="flex items-center mb-2">
            <span className="mr-2">📞</span> +254 729 491 343
          </p>
          <p className="flex items-center">
            <span className="mr-2">✉️</span> southcoastoutdoors25@gmail.com
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <ul className="space-y-2 text-justify">
            <li>
              <a href="#" className="hover:text-cyan-500">Accommodation</a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-500">Holidays</a>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-cyan-500">Review</a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-500">About Us</a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-500">FAQs</a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-500">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-500">Terms & Conditions</a>
            </li>
          </ul>
        </div>

        {/* Buttons Column */}
        <div className="space-y-4">
          <button className="border border-white px-4 py-2 w-full hover:bg-white hover:text-black transition">
            Extranet Login
          </button>
          <button className="border border-white px-4 py-2 w-full hover:bg-white hover:text-black transition">
            Partner With Us
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
