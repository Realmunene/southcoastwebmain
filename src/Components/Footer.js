import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import logo from "./images/IMG-20251008-WA0008logo0.png";
import{Link} from "react-router-dom";
const Footer = ({setActiveSection}) => {
  const navigate = useNavigate();
  return (
    <footer className="bg-black text-white py-10 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-justify">
        {/* Logo and Contact */}
        <div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-5">
                <img
            src={logo}
            alt="Southcoast Logo"
            className="h-12 mb-4" />
            <button
        onClick={()=> { 
          setActiveSection("contact");
          window.scrollTo({top:0, behavior: "smooth"});
        }}
        className="border border-white px-4 py-2 mb-5 hover:bg-white hover:text-black transition"
      >
        Contact Us
      </button>
          </div>
          <div className="flex space-x-4 mb-4 text-xl">
  <a href="https://web.facebook.com/profile.php?id=61580444043634&name=xhp_nt__fb__action__open_user&_rdc=1&_rdr#" aria-label="Facebook" className="hover:text-cyan-500 transition">
    <FontAwesomeIcon icon={faFacebookF} className="h-5 w-5" />
  </a>
  <a href="#" aria-label="Twitter" className="hover:text-cyan-500 transition">
    <FontAwesomeIcon icon={faTwitter} className="h-5 w-5" />
  </a>
  <a href="#" aria-label="Instagram" className="hover:text-cyan-500 transition">
    <FontAwesomeIcon icon={faInstagram} className="h-5 w-5" />
  </a>
  <a href="#" aria-label="LinkedIn" className="hover:text-cyan-500 transition">
    <FontAwesomeIcon icon={faLinkedinIn} className="h-5 w-5" />
  </a>
</div>
          <a href='tel:+254729491343' className="flex items-center mb-2">
            <span className="mr-2">📞</span> +254 729 491 343
          </a>
          <a 
          href="mailto:southcoastoutdoors25@gmail.com"
          className="flex items-center">
            <span className="mr-2">✉️</span> southcoastoutdoors25@gmail.com
          </a>
        </div>

        {/* Links Column 1 */}
        <div>
          <ul className="space-y-2 text-justify">
            <li>
              <Link to="/package" 
              className="hover:text-cyan-500">Accommodation</Link>
            </li>
            <li>
              <Link to="/gallery" 
              className="hover:text-cyan-500">Holidays</Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <ul className="space-y-2">
            <li>
              <a href="https://www.tripadvisor.com/" className="hover:text-cyan-500">Review</a>
            </li>
            <li>
              <Link to="/about" className="hover:text-cyan-500">About Us</Link>
            </li>
            <li>
              <Link to="/faqs" className="hover:text-cyan-500">FAQs</Link>
            </li>
            <li>
              <Link to="/policy" className="hover:text-cyan-500">Privacy Policy</Link>
            </li>
            <li>
              <Link to="terms" className="hover:text-cyan-500">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        {/* Buttons Column */}
        <div className="space-y-4">
          <button className="border border-white px-4 py-2 w-full hover:bg-white hover:text-black transition">
            Extranet Login
          </button>
          <button 
           onClick={()=> { 
          setActiveSection("partner");
          window.scrollTo({top:0, behavior: "smooth"});
        }}
          className="border border-white px-4 py-2 w-full hover:bg-white hover:text-black transition">
            Partner With Us
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
