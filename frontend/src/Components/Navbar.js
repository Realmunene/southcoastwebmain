import React, { useState, useEffect, useRef } from "react";
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
  faChevronDown,
  faCalendarCheck,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({
  onLoginClick,
  onPartnerClick,
  setActiveSection,
  user,
  onLogout,
  admin, // New prop for admin data
  onAdminLogout, // New prop for admin logout
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // --- Helper to get user display name ---
  const getDisplayName = (u) => {
    if (!u) return null;
    if (u.first_name?.trim()) return u.first_name;
    if (u.name?.trim()) return u.name.split(" ")[0];
    if (u.email) return u.email.split("@")[0];
    return "User";
  };
  const displayName = getDisplayName(user);

  // --- Helper to get admin display name ---
  const getAdminDisplayName = (admin) => {
    if (!admin) return null;
    return admin.name || admin.email.split('@')[0];
  };
  const adminDisplayName = getAdminDisplayName(admin);

  // --- Close user menu if clicked outside ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Check for admin on component mount ---
  useEffect(() => {
    // This could be used to sync with localStorage on component mount
    // The actual admin state should be managed by the parent component
  }, []);

  // --- Navigation handlers ---
  const handleHomeClick = () => {
    setActiveSection("home");
    setShowMenu(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMyBookings = () => {
    setShowUserMenu(false);
    setShowMenu(false);
    navigate("/mybookings");
  };

  const handleAdminDashboard = () => {
    setShowUserMenu(false);
    setShowMenu(false);
    navigate("/admin/dashboard");
  };

  // --- Logout handler for regular users ---
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken") || (user && user.token);
      
      const response = await fetch("https://southcoastoutdoors.cloud/api/v1/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        // Removed credentials: "include" to fix CORS issue
      });

      // Clear local storage regardless of server response
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      
      // Dispatch logout event to update all components
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      if (typeof onLogout === "function") {
        onLogout();
      }
      
      setShowUserMenu(false);
      setShowMenu(false);
      
      console.log("Logout successful");
      alert("✅ Logged out successfully!");
      navigate("/");

    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, clear local data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      if (typeof onLogout === "function") {
        onLogout();
      }
      setShowUserMenu(false);
      setShowMenu(false);
      
      alert("✅ Logged out successfully!");
      navigate("/");
    }
  };

  // --- Admin logout handler ---
  const handleAdminLogout = () => {
    // Clear admin data from localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    
    if (typeof onAdminLogout === "function") {
      onAdminLogout();
    }
    setShowUserMenu(false);
    setShowMenu(false);
    alert("✅ Admin logged out successfully!");
    navigate("/");
  };

  return (
    <div className="sticky top-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* LEFT SECTION - Logo */}
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="flex items-center space-x-3 focus:outline-none group"
            onClick={() => {
              setActiveSection("home");
              setShowMenu(false);
            }}
          >
            <img
              src={logo}
              alt="SCoast Logo"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent">
              SouthCoast
            </span>
          </Link>
        </div>

        {/* RIGHT SECTION - DESKTOP */}
        <div className="hidden lg:flex items-center space-x-8">
          {/* Navigation Links */}
          <Link
            to='/package'
            className="flex items-center space-x-2 text-gray-700 hover:text-cyan-600 transition-all duration-300 group font-medium"
          >
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <FontAwesomeIcon icon={faHouse} className="text-cyan-600 text-lg" />
            </div>
            <span>Book a Stay</span>
          </Link>

          <Link
            to='/gallery'
            className="flex items-center space-x-2 text-gray-700 hover:text-cyan-600 transition-all duration-300 group font-medium"
          >
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <FontAwesomeIcon icon={faUmbrellaBeach} className="text-cyan-600 text-lg" />
            </div>
            <span>Experiences</span>
          </Link>

          {/* Language Selector */}
          <div className="flex items-center space-x-2 text-gray-700 group cursor-pointer font-medium">
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <FontAwesomeIcon icon={faGlobe} className="text-cyan-600 text-lg" />
            </div>
            <span>ENG</span>
            <FontAwesomeIcon icon={faChevronDown} className="text-xs text-gray-400" />
          </div>

          {/* Partner With Us */}
          <Link
            to="/partnership"
            onClick={() => setShowMenu(false)}
            className="px-6 py-3 text-sm font-semibold text-cyan-600 border-2 border-cyan-600 rounded-full hover:bg-cyan-600 hover:text-white transition-all duration-300 flex items-center space-x-2 group"
          >
            <FontAwesomeIcon icon={faHandshake} className="group-hover:scale-110 transition-transform" />
            <span>Partner With Us</span>
          </Link>

          {/* ADMIN / USER MENU */}
          {admin ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-cyan-700 to-cyan-800 text-white text-sm font-semibold rounded-full hover:from-cyan-800 hover:to-cyan-900 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-3 group"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-cyan-200">Admin Panel</div>
                  <div className="text-sm">
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}: {adminDisplayName}
                  </div>
                </div>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-cyan-200 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} 
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl py-3 z-50 backdrop-blur-sm">
                  <button
                    onClick={handleAdminDashboard}
                    className="block w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-200 flex items-center space-x-3"
                  >
                    <FontAwesomeIcon icon={faReceipt} className="text-cyan-600" />
                    <span>Admin Dashboard</span>
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={handleAdminLogout}
                    className="block w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center space-x-3"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold rounded-full hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-3 group"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-cyan-200">Welcome back</div>
                  <div className="text-sm">{displayName}</div>
                </div>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-cyan-200 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} 
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-2xl shadow-2xl py-3 z-50 backdrop-blur-sm">
                  <button
                    onClick={handleMyBookings}
                    className="block w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-200 flex items-center space-x-3"
                  >
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-cyan-600" />
                    <span>My Bookings</span>
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center space-x-3"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              type="button"
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold rounded-full hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-3 group"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
              </div>
              <span>Log In / Sign Up</span>
            </button>
          )}
        </div>

        {/* HAMBURGER MENU - MOBILE */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="lg:hidden text-gray-700 focus:outline-none w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center hover:bg-cyan-200 transition-colors"
        >
          <FontAwesomeIcon 
            icon={showMenu ? faXmark : faBars} 
            className="text-cyan-600 text-xl" 
          />
        </button>
      </div>

      {/* MOBILE MENU CONTENT */}
      {showMenu && (
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-xl">
          <div className="flex flex-col p-6 space-y-4">
            {/* Navigation Links */}
            <Link
              to='/package'
              onClick={() => setShowMenu(false)}
              className="flex items-center space-x-4 text-gray-700 hover:text-cyan-600 transition-all duration-300 group py-3 px-4 rounded-2xl hover:bg-cyan-50"
            >
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                <FontAwesomeIcon icon={faHouse} className="text-cyan-600 text-lg" />
              </div>
              <span className="font-medium">Book a Stay</span>
            </Link>

            <Link
              to='/gallery'
              onClick={() => setShowMenu(false)}
              className="flex items-center space-x-4 text-gray-700 hover:text-cyan-600 transition-all duration-300 group py-3 px-4 rounded-2xl hover:bg-cyan-50"
            >
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                <FontAwesomeIcon icon={faUmbrellaBeach} className="text-cyan-600 text-lg" />
              </div>
              <span className="font-medium">Experiences</span>
            </Link>

            {/* Language Selector */}
            <div className="flex items-center space-x-4 text-gray-700 group py-3 px-4 rounded-2xl cursor-pointer">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                <FontAwesomeIcon icon={faGlobe} className="text-cyan-600 text-lg" />
              </div>
              <span className="font-medium">English</span>
            </div>

            {/* Partner With Us */}
            <Link
              to="/partnership"
              onClick={() => setShowMenu(false)}
              className="flex items-center space-x-4 text-cyan-600 hover:text-white transition-all duration-300 group py-3 px-4 rounded-2xl hover:bg-cyan-600 border-2 border-cyan-600"
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                <FontAwesomeIcon icon={faHandshake} className="text-white group-hover:text-cyan-600 text-lg" />
              </div>
              <span className="font-medium">Partner With Us</span>
            </Link>

            {/* Mobile admin / user */}
            {admin ? (
              <div className="flex flex-col space-y-4 mt-4 pt-4 border-t border-gray-200">
                <div className="px-4 py-2">
                  <div className="text-sm text-gray-500 mb-1">Admin Panel</div>
                  <div className="font-semibold text-cyan-700">
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}: {adminDisplayName}
                  </div>
                </div>
                
                <button
                  onClick={handleAdminDashboard}
                  className="flex items-center space-x-4 text-gray-700 hover:text-cyan-600 transition-all duration-300 group py-3 px-4 rounded-2xl hover:bg-cyan-50"
                >
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                    <FontAwesomeIcon icon={faReceipt} className="text-cyan-600 text-lg" />
                  </div>
                  <span className="font-medium">Admin Dashboard</span>
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="flex items-center space-x-4 text-red-600 hover:text-white transition-all duration-300 group py-3 px-4 rounded-2xl hover:bg-red-600 mt-2"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    <FontAwesomeIcon icon={faXmark} className="text-red-600 group-hover:text-red-600 text-lg" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : user ? (
              <div className="flex flex-col space-y-4 mt-4 pt-4 border-t border-gray-200">
                <div className="px-4 py-2">
                  <div className="text-sm text-gray-500 mb-1">Welcome back</div>
                  <div className="font-semibold text-cyan-600">{displayName}</div>
                </div>
                
                <button
                  onClick={handleMyBookings}
                  className="flex items-center space-x-4 text-gray-700 hover:text-cyan-600 transition-all duration-300 group py-3 px-4 rounded-2xl hover:bg-cyan-50"
                >
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-cyan-600 text-lg" />
                  </div>
                  <span className="font-medium">My Bookings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-4 text-red-600 hover:text-white transition-all duration-300 group py-3 px-4 rounded-2xl hover:bg-red-600 mt-2"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    <FontAwesomeIcon icon={faXmark} className="text-red-600 group-hover:text-red-600 text-lg" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onLoginClick();
                }}
                className="flex items-center space-x-4 text-white transition-all duration-300 group py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 mt-4"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faUser} className="text-white text-lg" />
                </div>
                <span className="font-semibold text-lg">Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}