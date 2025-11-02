// PackagePage.js
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Package from "./Package"; 
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
        const response = await fetch('https://backend-southcoastwebmain-1.onrender.com/api/v1/nationalities');
        
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

      const response = await fetch('https://backend-southcoastwebmain-1.onrender.com/api/v1/bookings', {
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
      ? "w-full border border-red-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
      : "w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400";

  // If user comes directly without state (refresh or direct URL)
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <p>Room information not available. Please return to the rooms page.</p>
        <Link to="/rooms" className="ml-2 text-cyan-600 hover:underline">
          Go to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div
          className="relative h-80 flex items-center justify-center text-white"
          style={{
            backgroundImage: `url(${room.image[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <h1 className="relative text-3xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">
            {room.title}
          </h1>
        </div>

        {/* Success Message - Shows when booking is successful */}
        {bookingSuccess && (
          <div className="max-w-7xl mx-auto mt-4 p-4 bg-green-100 text-green-700 rounded-md">
            <p className="font-semibold">✅ Booking successful!</p>
            <p>Your booking has been confirmed and the admin has been notified.</p>
          </div>
        )}

        {/* Login Alert - Only shows when booking is attempted without login */}
        {showLoginAlert && (
          <div className="max-w-7xl mx-auto mt-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
            <p>You need to be logged in to make a booking.</p>
          </div>
        )}

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="max-w-7xl mx-auto mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            <p className="font-semibold">Please fix the following errors:</p>
            <ul className="list-disc list-inside mt-2">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 🏨 Booking Component - UPDATED with separate adults/children inputs */}
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto border border-gray-400 flex flex-wrap bg-white shadow-md">
          {/* Nationality */}
          <div className="flex-1 min-w-[180px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Guest Nationality *
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
              <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
            )}
            {isLoadingNationalities && (
              <p className="text-xs text-gray-500 mt-1">Loading nationalities...</p>
            )}
          </div>

          {/* Room Type */}
          <div className="flex-1 min-w-[200px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Room Type *
            </label>
            <input 
              type="text" 
              name="roomType"
              value={bookingData.roomType}
              readOnly
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          {/* Dates */}
          <div className="flex-1 min-w-[280px] border-b md:border-b-0 md:border-r border-gray-300 p-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Check-in *
              </label>
              <input 
                type="date" 
                name="checkIn"
                value={bookingData.checkIn}
                onChange={handleInputChange}
                min={getTodayDate()} // Cannot select past dates
                className={getInputClass("checkIn")}
                required
              />
              {errors.checkIn && (
                <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>
              )}
              {!errors.checkIn && (
                <p className="text-xs text-gray-500 mt-1">Today or later</p>
              )}
            </div>
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Check-out *
              </label>
              <input 
                type="date" 
                name="checkOut"
                value={bookingData.checkOut}
                onChange={handleInputChange}
                min={bookingData.checkIn || getTodayDate()} // Minimum is check-in date or today
                className={getInputClass("checkOut")}
                required
              />
              {errors.checkOut && (
                <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>
              )}
              {!errors.checkOut && (
                <p className="text-xs text-gray-500 mt-1">After check-in</p>
              )}
            </div>
          </div>

          {/* Guests - UPDATED to two inputs */}
          <div className="flex-1 min-w-[200px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Guests *</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Adults</label>
                <input
                  type="text"
                  name="adults"
                  value={bookingData.adults}
                  onChange={handleInputChange}
                  className={getInputClass("adults")}
                  placeholder="Adults"
                  maxLength="2"
                />
                {errors.adults && (
                  <p className="text-red-500 text-xs mt-1">{errors.adults}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Children</label>
                <input
                  type="text"
                  name="children"
                  value={bookingData.children}
                  onChange={handleInputChange}
                  className={getInputClass("children")}
                  placeholder="Children"
                  maxLength="2"
                />
                {errors.children && (
                  <p className="text-red-500 text-xs mt-1">{errors.children}</p>
                )}
              </div>
            </div>
            {errors.guests && (
              <p className="text-red-500 text-xs mt-1">{errors.guests}</p>
            )}
            {!errors.guests && !errors.adults && !errors.children && (
              <p className="text-gray-500 text-xs mt-2">
                Total guests: {parseInt(bookingData.adults || 0) + parseInt(bookingData.children || 0)}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || (!user && pendingBooking)}
            className=" min-w-full md:min-w-[40px] flex items-center justify-center cursor-pointer transition text-white font-bold p-3 md:px-10 bg-cyan-500 hover:rounded-full hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!user ? "Please Login to Book" : 
             isSubmitting ? "Submitting..." : "Submit Booking"}
          </button>
        </form>

        {/* Message display */}
        {message && (
          <div className={`max-w-7xl mx-auto mt-4 p-4 rounded-md ${
            message.includes("❌") || message.includes("Error") || message.includes("Please") || message.includes("cannot") 
              ? "bg-red-100 text-red-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Room Details Section */}
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <img
              src={room.image[1]}
              alt={room.title}
              className="rounded-l-2xl w-full h-auto shadow-lg object-cover"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{room.title}</h2>
            <p className="text-gray-700 mb-4">
              Enjoy our luxurious {room.title} with modern amenities, elegant interiors,
              and a peaceful environment perfect for both business and leisure stays.
            </p>
            <p className="text-lg font-semibold text-cyan-600 mb-6">
              Price: {room.price} / night
            </p>
            <button 
              onClick={() => !user ? handleLoginPopup() : handleSubmit({ preventDefault: () => {} })}
              className={`px-5 py-2 rounded-lg font-semibold ${
                user 
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer" 
                  : "bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
              }`}
            >
              {user ? "Proceed to Booking" : "Login to Book"}
            </button>
          </div>
        </div>
      </div>

      {/* 🧳 Packages Section */}
      <div className="px-4 py-10">
        <Package />
      </div>

      <div className="w-full bg-cyan-200 py-14 p-auto flex text-center">
        <div className="flex justify-between flex-col md:flex-row gap-10">
          {/* Left Section - Join Us */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">
              Join the South Coast Experience
            </h2>
            <p className="text-gray-700 text-left px-6 leading-relaxed mb-4">
              Discover the beauty of Kenya's coastline like never before. At SouthCoast Outdoors,
              we make it easy for you to plan and enjoy unforgettable getaways filled with sun,
              sea, and adventure. From exclusive travel deals to inspiring destination highlights,
              we'll deliver the best offers straight to your inbox.
            </p>
            <p className="text-gray-700 text-left px-6 leading-relaxed mb-4">
              Whether it's flights, airport transfers, or exciting activities, we handle the
              details so you can focus on making lasting memories.
            </p>
            {user ? (
              <button 
                onClick={handleMyBookings}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
              >
                My Account
              </button>
            ) : (
              <button 
                onClick={handleJoinUsClick}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
              >
                Join Us
              </button>
            )}
          </div>

          {/* Right Section - Why South Coast */}
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Why SouthCoast Outdoors?</h3>
            <ul className="space-y-3 text-gray-700 px-6">
              <li>✅ Tailor-made holiday experiences</li>
              <li>✅ Trusted support from start to finish</li>
              <li>✅ Exceptional value for your money</li>
              <li>✅ Flexible travel options</li>
              <li>✅ Exclusive deals and offers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}