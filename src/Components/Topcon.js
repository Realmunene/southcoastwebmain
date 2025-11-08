import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faXTwitter, faTiktok } from "@fortawesome/free-brands-svg-icons";
import {  faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
const Topcon = () => {
  return (
    <div className="w-full bg-gradient-to-r from-cyan-500 to-blue-300 py-2 px-4 flex flex-wrap items-center justify-between shadow-md z-50">
                    {/* LEFT: CONTACTS */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 text-white space-y-2 sm:space-y-0">
                      <a
                        href="tel:+254729491343"
                        className="flex items-center space-x-2 hover:text-black transition"
                      >
                        <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                        <span>+254 729 491 343</span>
                      </a>

                      <a
                        href="mailto:southcoastoutdoors25@gmail.com"
                        className="flex items-center space-x-2 hover:text-gray-300 transition"
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                        <span>southcoastoutdoors25@gmail.com</span>
                      </a>
                    </div>

                    {/* RIGHT: SOCIAL ICONS */}
                    <div className="flex items-center text-white space-x-4 mt-2 sm:mt-0">
                      <a
                        href="https://web.facebook.com/profile.php?id=61580444043634&name=xhp_nt__fb__action__open_user&_rdc=1&_rdr#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-red-400 transition"
                      >
                        <FontAwesomeIcon icon={faFacebookF} className="text-lg" />
                      </a>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-red-400 transition"
                      >
                        <FontAwesomeIcon icon={faInstagram} className="text-lg" />
                      </a>
                      <a
                        href="https://x.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-red-400 transition"
                      >
                        <FontAwesomeIcon icon={faXTwitter} className="text-lg" />
                      </a>
                      <a
                        href="https://tiktok.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-red-400 transition"
                      >
                        <FontAwesomeIcon icon={faTiktok} className="text-lg" />
                      </a>
                    </div>
                  </div>
  )
}

export default Topcon
