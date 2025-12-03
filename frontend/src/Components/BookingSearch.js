import React, { useState, useEffect, useRef } from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendarDay, faCalendarCheck, faUsers, faGlobe, faBed } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";

export default function BookingSearch({ onLoginClick }) {
  const [nationalities, setNationalities] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [user, setUser] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [checkIn, setCheckIn] = useState(getTodayDate());
  const [checkOut, setCheckOut] = useState(getTomorrowDate());
  const [guests, setGuests] = useState({
    adults: "1",
    children: "0"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({
    formButton: false,
    heroButton: false
  });
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Enhanced user initialization with polling for popup login
  const checkUserAuth = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.token) {
      try {
        const decoded = jwtDecode(storedUser.token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.user_id, token: storedUser.token });
          return true;
        } else {
          localStorage.removeItem("user");
          setUser(null);
          return false;
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
        setUser(null);
        return false;
      }
    } else {
      setUser(null);
      return false;
    }
  };

  // Initialize user on mount
  useEffect(() => {
    checkUserAuth();
  }, []);

  // Enhanced storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        checkUserAuth();
      }
    };

    const handleUserLogin = () => {
      checkUserAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedIn", handleUserLogin);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedIn", handleUserLogin);
    };
  }, []);

  // Fetch nationalities and room types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [natRes, roomRes] = await Promise.all([
          fetch("https://southcoastoutdoors.cloud/api/v1/nationalities"),
          fetch("https://southcoastoutdoors.cloud/api/v1/room_types"),
        ]);

        if (!natRes.ok) throw new Error("Failed to fetch nationalities");
        if (!roomRes.ok) throw new Error("Failed to fetch room types");

        const natData = await natRes.json();
        const roomData = await roomRes.json();

        setNationalities(natData.map((item) => ({ ...item, __key: item.id ?? uuidv4() })));
        setRoomTypes(roomData.map((item) => ({ ...item, __key: item.id ?? uuidv4() })));
      } catch (err) {
        console.error(err);
        setNationalities([]);
        setRoomTypes([]);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const today = getTodayDate();

    if (!selectedNationality) newErrors.selectedNationality = "Nationality is required";
    if (!selectedRoomType) newErrors.selectedRoomType = "Room type is required";
    if (!checkIn) newErrors.checkIn = "Check-in date is required";
    if (!checkOut) newErrors.checkOut = "Check-out date is required";
    
    const adults = parseInt(guests.adults, 10);
    const children = parseInt(guests.children, 10);
    const totalGuests = adults + children;

    // Updated validation for adults (max 2)
    if (!guests.adults || isNaN(adults) || adults < 1 || adults > 2) {
      newErrors.adults = "Adults must be between 1 and 2";
    }
    
    // Updated validation for children (max 3)
    if (!guests.children || isNaN(children) || children < 0 || children > 3) {
      newErrors.children = "Children must be between 0 and 3";
    }

    // Updated total guests validation (max 5: 2 adults + 3 children)
    if (totalGuests < 1 || totalGuests > 5) {
      newErrors.guests = "Total guests must be between 1 and 5";
    }

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const todayDate = new Date(today);

      if (checkInDate < todayDate) {
        newErrors.checkIn = "Check-in date cannot be in the past";
      }

      if (checkOutDate < todayDate) {
        newErrors.checkOut = "Check-out date cannot be in the past";
      }

      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "Check-out date must be after check-in date";
      }

      const stayDuration = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
      if (stayDuration > 30) {
        newErrors.checkOut = "Maximum stay duration is 30 days";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeBooking = async (token, userId, buttonType) => {
    if (!validateForm()) {
      alert("Please fix the form errors before submitting.");
      return;
    }

    setLoading(prev => ({ ...prev, [buttonType]: true }));
    setBookingSuccess(false);

    try {
      const bookingData = {
        booking: {
          nationality: selectedNationality,
          room_type: selectedRoomType,
          check_in: checkIn,
          check_out: checkOut,
          adults: parseInt(guests.adults, 10),
          children: parseInt(guests.children, 10)
        },
      };

      const response = await fetch("https://southcoastoutdoors.cloud/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        setBookingSuccess(true);
        
        setSelectedNationality("");
        setSelectedRoomType("");
        setCheckIn(getTodayDate());
        setCheckOut(getTomorrowDate());
        setGuests({
          adults: "1",
          children: "0"
        });
        setErrors({});

        setTimeout(() => {
          setBookingSuccess(false);
        }, 5000);
      } else {
        console.error("Booking error:", result);
        alert(`Booking failed: ${result.error || result.errors?.join(", ") || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed due to network error. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, [buttonType]: false }));
    }
  };

  // Handle check-in date change
  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    
    let newCheckOut = checkOut;
    if (newCheckIn && checkOut && newCheckIn >= checkOut) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      newCheckOut = nextDay.toISOString().split('T')[0];
    }
    
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    setErrors((prev) => ({ ...prev, checkIn: "", checkOut: "" }));
  };

  // Handle check-out date change
  const handleCheckOutChange = (e) => {
    const newCheckOut = e.target.value;
    setCheckOut(newCheckOut);
    setErrors((prev) => ({ ...prev, checkOut: "" }));
  };

  // Handle guest input changes with restrictions
  const handleGuestChange = (type, value) => {
    const numericValue = value.replace(/\D/g, '');
    
    // Apply restrictions based on guest type
    let restrictedValue = numericValue;
    if (type === "adults" && numericValue !== "") {
      const adultCount = parseInt(numericValue, 10);
      if (adultCount > 2) {
        restrictedValue = "2";
      }
    } else if (type === "children" && numericValue !== "") {
      const childCount = parseInt(numericValue, 10);
      if (childCount > 3) {
        restrictedValue = "3";
      }
    }
    
    setGuests(prev => ({
      ...prev,
      [type]: restrictedValue
    }));
    
    setErrors(prev => ({ 
      ...prev, 
      [type]: "",
      guests: "" 
    }));
  };

  // Enhanced booking handler with login alert
  const handleFormBooking = () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    executeBooking(user.token, user.id, 'formButton');
  };

  const handleHeroBooking = () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    executeBooking(user.token, user.id, 'heroButton');
  };

  // Auto-hide login alert after 5 seconds
  useEffect(() => {
    if (showLoginAlert) {
      const timer = setTimeout(() => {
        setShowLoginAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showLoginAlert]);

  const getInputClass = (field) =>
    errors[field]
      ? "w-full border-2 border-red-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors bg-white/90"
      : "w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors bg-white/90";

  return (
    <div className="my-background py-8">
      {/* Booking Form Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            
            {/* Nationality */}
            <div className="border-b md:border-b-0 md:border-r border-gray-200/50 p-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} className="text-cyan-600 text-sm" />
                Guest Nationality
              </label>
              <select
                value={selectedNationality}
                onChange={(e) => {
                  setSelectedNationality(e.target.value);
                  setErrors((prev) => ({ ...prev, selectedNationality: "" }));
                }}
                className={getInputClass("selectedNationality")}
              >
                <option value="">Select Nationality</option>
                {nationalities.map((nat) => (
                  <option key={nat.__key} value={nat.name}>
                    {nat.name}
                  </option>
                ))}
              </select>
              {errors.selectedNationality && (
                <p className="text-red-400 text-xs mt-2 font-medium">{errors.selectedNationality}</p>
              )}
            </div>

            {/* Room Type */}
            <div className="border-b md:border-b-0 md:border-r border-gray-200/50 p-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faBed} className="text-cyan-600 text-sm" />
                Room Type
              </label>
              <select
                value={selectedRoomType}
                onChange={(e) => {
                  setSelectedRoomType(e.target.value);
                  setErrors((prev) => ({ ...prev, selectedRoomType: "" }));
                }}
                className={getInputClass("selectedRoomType")}
              >
                <option value="">Select Room Type</option>
                {roomTypes.map((room) => (
                  <option key={room.__key} value={room.name}>
                    {room.name}
                  </option>
                ))}
              </select>
              {errors.selectedRoomType && (
                <p className="text-red-400 text-xs mt-2 font-medium">{errors.selectedRoomType}</p>
              )}
            </div>

            {/* Dates */}
            <div className="border-b md:border-b-0 md:border-r border-gray-200/50 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarDay} className="text-cyan-600 text-sm" />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={getTodayDate()}
                    onChange={handleCheckInChange}
                    className={getInputClass("checkIn")}
                  />
                  {errors.checkIn && (
                    <p className="text-red-400 text-xs mt-2 font-medium">{errors.checkIn}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-cyan-600 text-sm" />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || getTodayDate()}
                    onChange={handleCheckOutChange}
                    className={getInputClass("checkOut")}
                  />
                  {errors.checkOut && (
                    <p className="text-red-400 text-xs mt-2 font-medium">{errors.checkOut}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="border-b md:border-b-0 md:border-r border-gray-200/50 p-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-cyan-600 text-sm" />
                Guests
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">
                    Adults <span className="text-gray-400">(max 2)</span>
                  </label>
                  <input
                    type="text"
                    value={guests.adults}
                    onChange={(e) => handleGuestChange("adults", e.target.value)}
                    className={getInputClass("adults")}
                    placeholder="0"
                    maxLength="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">
                    Children <span className="text-gray-400">(max 3)</span>
                  </label>
                  <input
                    type="text"
                    value={guests.children}
                    onChange={(e) => handleGuestChange("children", e.target.value)}
                    className={getInputClass("children")}
                    placeholder="0"
                    maxLength="1"
                  />
                </div>
              </div>
              {errors.guests && (
                <p className="text-red-400 text-xs mt-2 font-medium">{errors.guests}</p>
              )}
              {!errors.guests && (
                <p className="text-gray-600 text-xs mt-2 font-medium">
                  Total: {parseInt(guests.adults || 0) + parseInt(guests.children || 0)} guests (max 5)
                </p>
              )}
            </div>

            {/* Book Button */}
            <div className="p-6 flex items-center justify-center">
              <button
                type="button"
                onClick={handleFormBooking}
                disabled={loading.formButton}
                className={`w-full max-w-xs flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                  loading.formButton 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl"
                }`}
              >
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className={`text-lg ${loading.formButton ? "animate-spin" : ""}`} 
                />
                <span>
                  {loading.formButton ? "Processing..." : (user ? "Book Now" : "Login to Book")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-6 space-y-4">
          {/* Success Message */}
          {bookingSuccess && (
            <div className="bg-green-500/90 backdrop-blur-sm border border-green-300 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faSearch} className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-semibold text-white">Booking Confirmed!</p>
                  <p className="text-green-100 text-sm">Your reservation has been successfully created and the admin has been notified.</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Alert */}
          {showLoginAlert && (
            <div className="bg-amber-500/90 backdrop-blur-sm border border-amber-300 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-semibold text-white">Authentication Required</p>
                  <p className="text-amber-100 text-sm">Please log in to complete your booking.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-500/90 backdrop-blur-sm border border-red-300 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faSearch} className="text-white text-sm" />
                </div>
                <p className="font-semibold text-white">Please correct the following issues:</p>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="text-red-100 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            YOUR JOURNEY
            <span className="block text-cyan-500 drop-shadow-lg">
              BEGINS WITH A STAY
            </span>
          </h1>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-8 font-light drop-shadow">
              Just 300 meters from the beach, we offer the perfect escape with a refreshing pool,
              free parking, and 5 kitchens for self-cooking or a private chef. Enjoy thrilling
              adventures like kite surfing, snorkeling, scuba diving, dhow cruises, and safaris to
              national parks. Your unforgettable getaway starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/about"
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                LEARN MORE
              </Link>
              <button
                onClick={handleHeroBooking}
                disabled={loading.heroButton}
                className={`border-2 font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  loading.heroButton
                    ? "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
                    : "border-cyan-300 text-cyan-300 hover:bg-cyan-300 hover:text-gray-900 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading.heroButton ? "PROCESSING..." : user ? "BOOK NOW" : "LOGIN TO BOOK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}