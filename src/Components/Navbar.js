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
    navigate("/southcoastwebmain");
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
      
      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/logout", {
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
      navigate("/southcoastwebmain");

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
      navigate("/southcoastwebmain");
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
    navigate("/southcoastwebmain");
  };

  return (
    <div className="sticky top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* LEFT SECTION */}
        <div className="flex items-center space-x-4">
          <Link
            to="/southcoastwebmain"
            className="flex items-center space-x-1 focus:outline-none"
            onClick={() => {
              setActiveSection("home");
              setShowMenu(false);
            }}
          >
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
          <Link
            to='/package'
            className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
          >
            <FontAwesomeIcon icon={faHouse} className="text-lg" />
            <span className="text-sm font-medium">Book a Stay</span>
          </Link>

          <span className="text-gray-300 text-xl">|</span>

          <Link
            to='/gallery'
            className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition"
          >
            <FontAwesomeIcon icon={faUmbrellaBeach} className="text-lg" />
            <span className="text-sm font-medium">Experiences</span>
          </Link>

          <span className="text-gray-300 text-xl">|</span>

          <button className="flex items-center space-x-1 text-gray-700 hover:text-coral-500 transition">
            <FontAwesomeIcon icon={faGlobe} className="text-lg" />
            <span className="text-sm font-medium">LNG</span>
            <span className="text-xs">▼</span>
          </button>

          <span className="text-gray-300 text-xl">|</span>

          <Link
            to="/partnership"
            onClick={() => setShowMenu(false)}
            className="px-3 py-2 text-sm font-medium text-gray-700 border rounded-full hover:bg-coral-500 hover:text-black transition flex items-center"
          >
            <FontAwesomeIcon icon={faHandshake} className="mr-1" />
            Partner With Us
          </Link>

          {/* ADMIN / USER MENU */}
          {admin ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                type="button"
                className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-full hover:bg-purple-600 transition inline-flex items-center"
                aria-expanded={showUserMenu}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span className="mr-2">
                  {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}: {adminDisplayName}
                </span>
                <FontAwesomeIcon icon={faChevronDown} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md py-1 z-50">
                  <button
                    onClick={handleAdminDashboard}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-100"
                  >
                    Admin Dashboard
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-purple-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                type="button"
                className="px-4 py-2 bg-coral-500 text-black text-sm font-medium rounded-full hover:bg-coral-600 transition inline-flex items-center"
                aria-expanded={showUserMenu}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span className="mr-2">{displayName}</span>
                <FontAwesomeIcon icon={faChevronDown} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md py-1 z-50">
                  <button
                    onClick={handleMyBookings}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-cyan-100"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-cyan-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              type="button"
              className="px-4 py-2 bg-coral-500 text-black text-sm font-medium rounded-full hover:bg-coral-600 transition"
            >
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              Log In / Sign Up
            </button>
          )}
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
              <span>LNG ▼</span>
            </button>

            <Link
              to="/partnership"
              onClick={() => setShowMenu(false)}
              className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition"
            >
              <FontAwesomeIcon icon={faHandshake} />
              <span>Partner With Us</span>
            </Link>

            {/* Mobile admin / user */}
            {admin ? (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleAdminDashboard}
                  className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-full hover:bg-purple-600 transition inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}: {adminDisplayName}
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2 bg-gray-100 text-sm font-medium rounded-full hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </div>
            ) : user ? (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleMyBookings}
                  className="px-4 py-2 bg-cyan-500 text-black text-sm font-medium rounded-full hover:bg-coral-600 transition inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {displayName}
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 text-sm font-medium rounded-full hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onLoginClick();
                }}
                className="px-4 py-2 bg-coral-500 text-black text-sm font-medium rounded-full hover:bg-coral-600 transition"
              >
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                Log In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}