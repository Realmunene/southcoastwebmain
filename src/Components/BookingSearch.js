import React, { useState, useEffect, useRef } from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
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
  const [guests, setGuests] = useState("1");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ✅ Enhanced user initialization with polling for popup login
  const checkUserAuth = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.token) {
      try {
        const decoded = jwtDecode(storedUser.token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.user_id, token: storedUser.token });
          return true;
        } else {
          // Token expired, remove it
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

  // ✅ Initialize user on mount
  useEffect(() => {
    checkUserAuth();
  }, []);

  // ✅ Enhanced storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        checkUserAuth();
      }
    };

    const handleUserLogin = () => {
      checkUserAuth();
    };

    // Listen for storage changes (cross-tab)
    window.addEventListener("storage", handleStorageChange);
    
    // Listen for custom login event (same-tab)
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
          fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/nationalities"),
          fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/room_types"),
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
    if (!guests) newErrors.guests = "Number of guests is required";

    // Date validations
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
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

    if (guests && (isNaN(guests) || guests < 1 || guests > 20)) {
      newErrors.guests = "Guests must be between 1 and 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeBooking = async (token, userId) => {
    if (!validateForm()) {
      alert("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);
    setBookingSuccess(false);

    try {
      const bookingData = {
        booking: {
          user_id: userId,
          nationality: selectedNationality,
          room_type: selectedRoomType,
          check_in: checkIn,
          check_out: checkOut,
          guests: parseInt(guests, 10),
        },
      };

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ Show success message and reset form
        setBookingSuccess(true);
        
        // Reset form fields
        setSelectedNationality("");
        setSelectedRoomType("");
        setCheckIn(getTodayDate());
        setCheckOut(getTomorrowDate());
        setGuests("1");
        setErrors({});

        // Auto-hide success message after 5 seconds
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
      setLoading(false);
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

  // ✅ Enhanced booking handler with login alert
  const handleBooking = () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    executeBooking(user.token, user.id);
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
      ? "w-full border border-red-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
      : "w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-600";

  return (
    <div className="my-background py-4">
      <div className="max-w-7xl mx-auto border border-gray-400 flex flex-wrap bg-white shadow-md">
        {/* Nationality */}
        <div className="flex-1 min-w-[180px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Guest Nationality</label>
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
            <p className="text-red-500 text-xs mt-1">{errors.selectedNationality}</p>
          )}
        </div>

        {/* Room Type */}
        <div className="flex-1 min-w-[200px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Room Type</label>
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
            <p className="text-red-500 text-xs mt-1">{errors.selectedRoomType}</p>
          )}
        </div>

        {/* Dates */}
        <div className="flex-1 min-w-[280px] border-b md:border-b-0 md:border-r border-gray-300 p-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={getTodayDate()}
              onChange={handleCheckInChange}
              className={getInputClass("checkIn")}
            />
            {errors.checkIn && (
              <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>
            )}
            {!errors.checkIn && (
              <p className="text-gray-500 text-xs mt-1">Today or later</p>
            )}
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || getTodayDate()}
              onChange={handleCheckOutChange}
              className={getInputClass("checkOut")}
            />
            {errors.checkOut && (
              <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>
            )}
            {!errors.checkOut && (
              <p className="text-gray-500 text-xs mt-1">After check-in</p>
            )}
          </div>
        </div>

        {/* Guests */}
        <div className="flex-1 min-w-[160px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Guests</label>
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/, "");
              setGuests(value);
              setErrors((prev) => ({ ...prev, guests: "" }));
            }}
            className={getInputClass("guests")}
            placeholder="Number of guests"
          />
          {errors.guests && (
            <p className="text-red-500 text-xs mt-1">{errors.guests}</p>
          )}
          {!errors.guests && (
            <p className="text-gray-500 text-xs mt-1">1-20 guests</p>
          )}
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleBooking}
          disabled={loading}
          className={`min-w-full md:min-w-[40px] flex items-center justify-center cursor-pointer transition p-3 md:px-10 ${
            loading 
              ? "bg-gray-400" 
              : "bg-cyan-500 hover:bg-cyan-600"
          } text-white  hover:rounded-full`}
        >
          <FontAwesomeIcon 
            icon={faSearch} 
            className={`text-lg ${loading ? "text-gray-200" : "text-white"}`} 
          />
          {loading && <span className="ml-2">Booking...</span>}
          {!loading && <span className="ml-2">{user ? "Book Now" : "Login to Book"}</span>}
        </button>
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

      {/* Hero Section */}
      <div className="py-20 text-4xl md:text-7xl font-extrabold text-center text-white text-shadow-lg/30">
        <h1 className="py-3">YOUR JOURNEY</h1>
        <h1 className="py-2">BEGINS WITH A STAY</h1>
        <div className="relative flex flex-col items-center justify-center text-white text-center py-6">
          <div className="relative max-w-2xl">
            <p className="text-base md:text-lg font-normal font-sans mb-6 leading-relaxed">
              Just 300 meters from the beach, we offer the perfect escape with a refreshing pool,
              free parking, and 5 kitchens for self-cooking or a private chef. Enjoy thrilling
              adventures like kite surfing, snorkeling, scuba diving, dhow cruises, and safaris to
              national parks. Your unforgettable getaway starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/about"
                className="bg-cyan-500 hover:bg-blue-700 text-white text-sm font-medium py-2 px-6 rounded-full transition"
              >
                LEARN MORE
              </Link>
              <button
                onClick={handleBooking}
                disabled={loading}
                className={`border-2 text-sm font-medium py-2 px-6 rounded-full transition ${
                  loading
                    ? "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
                    : "border-white hover:bg-white hover:text-black text-white"
                }`}
              >
                {loading ? "BOOKING..." : user ? "BOOK NOW" : "LOGIN TO BOOK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}