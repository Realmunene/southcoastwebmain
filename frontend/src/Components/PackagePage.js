// PackagePage.js
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Package from "./Package"; 
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faCalendarCheck, faUsers, faGlobe, faBed, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function PackagePage({ onLoginClick, user, onLogout }) {
  const { roomTitle } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room;

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

  // State for booking form - UPDATED with adults and children
  const [bookingData, setBookingData] = useState({
    nationality: "",
    roomType: room?.title || "",
    checkIn: getTodayDate(), // Default to today
    checkOut: getTomorrowDate(), // Default to tomorrow
    adults: "1",
    children: "0"
  });
  const [nationalities, setNationalities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingNationalities, setIsLoadingNationalities] = useState(true);
  const [pendingBooking, setPendingBooking] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Enhanced authentication check
  const checkUserAuth = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser?.token) {
        const decoded = jwtDecode(storedUser.token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          return true;
        } else {
          // Token expired, remove it
          localStorage.removeItem("user");
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    checkUserAuth();
  }, []);

  // Listen for login events
  useEffect(() => {
    const handleUserLogin = () => {
      checkUserAuth();
      // If there was a pending booking, execute it after login
      if (pendingBooking) {
        setPendingBooking(false);
        setTimeout(() => {
          handleSubmit({ preventDefault: () => {} });
        }, 500);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "user") {
        checkUserAuth();
      }
    };

    window.addEventListener("userLoggedIn", handleUserLogin);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("userLoggedIn", handleUserLogin);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pendingBooking]);

  // Auto-hide login alert after 5 seconds
  useEffect(() => {
    if (showLoginAlert) {
      const timer = setTimeout(() => {
        setShowLoginAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showLoginAlert]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (bookingSuccess) {
      const timer = setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingSuccess]);

  // Fetch nationalities from API
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await fetch('https://southcoastoutdoors.cloud/api/v1/nationalities');
        
        // First get response as text to check if it's valid JSON
        const responseText = await response.text();
        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.log("Server Response:", responseText.substring(0, 200));
          throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
        }

        if (response.ok) {
          setNationalities(data);
        } else {
          throw new Error('Failed to fetch nationalities');
        }
      } catch (error) {
        console.error('Error fetching nationalities:', error);
        setMessage("Error loading nationalities. Please refresh the page.");
        // Fallback nationalities in case API fails
        setNationalities([
          { id: 1, name: "Kenyan" },
          { id: 2, name: "American" },
          { id: 3, name: "British" },
          { id: 4, name: "Canadian" },
          { id: 5, name: "German" },
          { id: 6, name: "French" },
          { id: 7, name: "Chinese" },
          { id: 8, name: "Indian" },
          { id: 9, name: "Australian" },
          { id: 10, name: "Japanese" },
          { id: 11, name: "South African" },
          { id: 12, name: "Ugandan" },
          { id: 13, name: "Tanzanian" },
          { id: 14, name: "Rwandan" },
          { id: 15, name: "Ethiopian" },
        ]);
      } finally {
        setIsLoadingNationalities(false);
      }
    };

    fetchNationalities();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For guest inputs (adults and children), ensure they're numbers and within limits
    if (name === 'adults' || name === 'children') {
      const numericValue = value.replace(/\D/g, '');
      
      setBookingData(prev => ({
        ...prev,
        [name]: numericValue
      }));

      // Clear guest-related errors when user starts typing
      setErrors(prev => ({ 
        ...prev, 
        [name]: "",
        guests: "" 
      }));
      return;
    }

    // For check-in date changes
    if (name === 'checkIn') {
      const newCheckIn = value;
      let newCheckOut = bookingData.checkOut;
      
      // If new check-in is after current check-out, reset check-out to next day
      if (newCheckIn && newCheckOut && newCheckIn >= newCheckOut) {
        const nextDay = new Date(newCheckIn);
        nextDay.setDate(nextDay.getDate() + 1);
        newCheckOut = nextDay.toISOString().split('T')[0];
      }
      
      setBookingData(prev => ({
        ...prev,
        checkIn: newCheckIn,
        checkOut: newCheckOut
      }));

      setErrors(prev => ({ ...prev, checkIn: "", checkOut: "" }));
      return;
    }

    // For check-out date changes
    if (name === 'checkOut') {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
      setErrors(prev => ({ ...prev, checkOut: "" }));
      return;
    }

    // For nationality and room type
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'nationality') {
      setErrors(prev => ({ ...prev, nationality: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const today = getTodayDate();

    if (!bookingData.nationality) newErrors.nationality = "Nationality is required";
    
    // Guest validations
    const adults = parseInt(bookingData.adults, 10);
    const children = parseInt(bookingData.children, 10);
    const totalGuests = adults + children;

    if (!bookingData.adults || isNaN(adults) || adults < 1 || adults > 20) {
      newErrors.adults = "Adults must be between 1 and 20";
    }
    
    if (!bookingData.children || isNaN(children) || children < 0 || children > 20) {
      newErrors.children = "Children must be between 0 and 20";
    }

    if (totalGuests < 1 || totalGuests > 20) {
      newErrors.guests = "Total guests must be between 1 and 20";
    }

    // Date validations
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const todayDate = new Date(today);

      // Check if check-in is today or in the future
      if (checkInDate < todayDate) {
        newErrors.checkIn = "Check-in date cannot be in the past";
      }

      // Check if check-out is today or in the future
      if (checkOutDate < todayDate) {
        newErrors.checkOut = "Check-out date cannot be in the past";
      }

      // Check if check-out is after check-in
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "Check-out date must be after check-in date";
      }

      // Optional: Maximum stay duration (30 days)
      const stayDuration = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
      if (stayDuration > 30) {
        newErrors.checkOut = "Maximum stay duration is 30 days";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login popup FOR BOOKING
  const handleLoginPopup = () => {
    setPendingBooking(true);
    setShowLoginAlert(true);
    if (typeof onLoginClick === "function") {
      onLoginClick();
    } else {
      alert("Please log in to make a booking");
    }
  };

  // Handle Join Us button click - SEPARATE FUNCTION
  const handleJoinUsClick = () => {
    if (typeof onLoginClick === "function") {
      onLoginClick();
    } else {
      // This should not happen if the prop is properly passed
      console.error("onLoginClick prop not provided to PackagePage");
      alert("Please log in to join South Coast");
    }
  };

  // Handle My Bookings navigation
  const handleMyBookings = () => {
    navigate("/mybookings");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      handleLoginPopup();
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage("");
    setBookingSuccess(false);

    try {
      if (!user.token) {
        throw new Error('No authentication token found');
      }

      // Prepare the data to send to backend - UPDATED with adults and children
      const bookingPayload = {
        booking: {
          nationality: bookingData.nationality,
          room_type: bookingData.roomType,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          adults: parseInt(bookingData.adults, 10),
          children: parseInt(bookingData.children, 10)
        }
      };

      const response = await fetch('https://southcoastoutdoors.cloud/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(bookingPayload),
      });

      // First get response as text to check if it's valid JSON
      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      if (response.ok) {
        // ✅ Show success message and reset form
        setBookingSuccess(true);
        
        // Reset form
        setBookingData({
          nationality: "",
          roomType: room?.title || "",
          checkIn: getTodayDate(),
          checkOut: getTomorrowDate(),
          adults: "1",
          children: "0"
        });
        setErrors({});

      } else {
        console.error("Booking error:", result);
        throw new Error(result.error || result.errors?.join(", ") || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setMessage(`❌ ${error.message || "Error submitting booking. Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function for input classes
  const getInputClass = (field) =>
    errors[field]
      ? "w-full border-2 border-red-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors bg-white/90"
      : "w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors bg-white/90";

  // If user comes directly without state (refresh or direct URL)
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <p className="text-gray-700 text-lg mb-4">Room information not available.</p>
          <Link 
            to="/rooms" 
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Return to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-96 flex items-center justify-center text-white"
        style={{
          backgroundImage: `url(${room.image[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {room.title}
          </h1>
          <p className="text-xl md:text-2xl text-cyan-200 font-light drop-shadow">
            Luxury Accommodation & Unforgettable Experiences
          </p>
        </div>
      </div>

      {/* Status Messages */}
      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-4">
        {/* Success Message */}
        {bookingSuccess && (
          <div className="bg-green-500/90 backdrop-blur-sm border border-green-300 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
              </div>
              <div>
                <p className="font-semibold text-white">Booking Confirmed!</p>
                <p className="text-green-100 text-sm">Your booking has been confirmed and the admin has been notified.</p>
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
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
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

      {/* Booking Form Section */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            
            {/* Nationality */}
            <div className="border-b md:border-b-0 md:border-r border-gray-200/50 p-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} className="text-cyan-600 text-sm" />
                Guest Nationality
              </label>
              <select 
                name="nationality"
                value={bookingData.nationality}
                onChange={handleInputChange}
                className={getInputClass("nationality")}
                required
                disabled={isLoadingNationalities}
              >
                <option value="">Select Nationality</option>
                {nationalities.map((nationality) => (
                  <option key={nationality.id || nationality.name} value={nationality.name}>
                    {nationality.name}
                  </option>
                ))}
              </select>
              {errors.nationality && (
                <p className="text-red-500 text-xs mt-2 font-medium">{errors.nationality}</p>
              )}
              {isLoadingNationalities && (
                <p className="text-xs text-gray-500 mt-2">Loading nationalities...</p>
              )}
            </div>

            {/* Room Type */}
            <div className="border-b md:border-b-0 md:border-r border-gray-200/50 p-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faBed} className="text-cyan-600 text-sm" />
                Room Type
              </label>
              <input 
                type="text" 
                name="roomType"
                value={bookingData.roomType}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-700"
                required
              />
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
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    className={getInputClass("checkIn")}
                    required
                  />
                  {errors.checkIn && (
                    <p className="text-red-500 text-xs mt-2 font-medium">{errors.checkIn}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-cyan-600 text-sm" />
                    Check-out
                  </label>
                  <input 
                    type="date" 
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleInputChange}
                    min={bookingData.checkIn || getTodayDate()}
                    className={getInputClass("checkOut")}
                    required
                  />
                  {errors.checkOut && (
                    <p className="text-red-500 text-xs mt-2 font-medium">{errors.checkOut}</p>
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
                  <label className="block text-xs text-gray-600 mb-1 font-medium">Adults</label>
                  <input
                    type="text"
                    name="adults"
                    value={bookingData.adults}
                    onChange={handleInputChange}
                    className={getInputClass("adults")}
                    placeholder="0"
                    maxLength="2"
                  />
                  {errors.adults && (
                    <p className="text-red-500 text-xs mt-2 font-medium">{errors.adults}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">Children</label>
                  <input
                    type="text"
                    name="children"
                    value={bookingData.children}
                    onChange={handleInputChange}
                    className={getInputClass("children")}
                    placeholder="0"
                    maxLength="2"
                  />
                  {errors.children && (
                    <p className="text-red-500 text-xs mt-2 font-medium">{errors.children}</p>
                  )}
                </div>
              </div>
              {errors.guests && (
                <p className="text-red-500 text-xs mt-2 font-medium">{errors.guests}</p>
              )}
              {!errors.guests && !errors.adults && !errors.children && (
                <p className="text-gray-600 text-xs mt-2 font-medium">
                  Total: {parseInt(bookingData.adults || 0) + parseInt(bookingData.children || 0)} guests
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="p-6 flex items-center justify-center">
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={isSubmitting || (!user && pendingBooking)}
                className={`w-full max-w-xs flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                  isSubmitting || (!user && pendingBooking)
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {!user ? "Login to Book" : 
                 isSubmitting ? "Processing..." : "Book Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message display */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className={`rounded-xl p-4 shadow-lg ${
            message.includes("❌") || message.includes("Error") || message.includes("Please") || message.includes("cannot") 
              ? "bg-red-500/90 text-white" 
              : "bg-green-500/90 text-white"
          }`}>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                className={`text-sm ${message.includes("❌") ? "text-red-100" : "text-green-100"}`}
              />
              <span>{message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Room Details Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="p-8">
              <img
                src={room.image[1]}
                alt={room.title}
                className="rounded-2xl w-full h-80 object-cover shadow-lg"
              />
            </div>

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{room.title}</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Enjoy our luxurious {room.title} with modern amenities, elegant interiors,
                and a peaceful environment perfect for both business and leisure stays.
              </p>
              <p className="text-2xl font-bold text-cyan-600 mb-8">
                {room.price} / night
              </p>
              <button 
                onClick={() => !user ? handleLoginPopup() : handleSubmit({ preventDefault: () => {} })}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  user 
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl" 
                    : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {user ? "Book This Room" : "Login to Book"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🧳 Packages Section */}
      <div className="px-4 py-16 bg-gray-100/50">
        <Package />
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Section - Join Us */}
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                Join the South Coast Experience
              </h2>
              <p className="text-cyan-100 leading-relaxed mb-6">
                Discover the beauty of Kenya's coastline like never before. At SouthCoast Outdoors,
                we make it easy for you to plan and enjoy unforgettable getaways filled with sun,
                sea, and adventure. From exclusive travel deals to inspiring destination highlights,
                we'll deliver the best offers straight to your inbox.
              </p>
              <p className="text-cyan-100 leading-relaxed mb-8">
                Whether it's flights, airport transfers, or exciting activities, we handle the
                details so you can focus on making lasting memories.
              </p>
              {user ? (
                <button 
                  onClick={handleMyBookings}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  My Account
                </button>
              ) : (
                <button 
                  onClick={handleJoinUsClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Join Us Today
                </button>
              )}
            </div>

            {/* Right Section - Why South Coast */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/40">
              <h3 className="text-2xl font-bold text-white mb-6">Why SouthCoast Outdoors?</h3>
              <ul className="space-y-4 text-white">
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span>Tailor-made holiday experiences</span>
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span>Trusted support from start to finish</span>
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span>Exceptional value for your money</span>
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span>Flexible travel options</span>
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span>Exclusive deals and offers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}