// PackagePage.js
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Package from "./Package"; 
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function PackagePage({ onLoginClick }) {
  const { roomTitle } = useParams();
  const location = useLocation();
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

  // State for booking form
  const [bookingData, setBookingData] = useState({
    nationality: "",
    roomType: room?.title || "",
    checkIn: getTodayDate(), // Default to today
    checkOut: getTomorrowDate(), // Default to tomorrow
    guests: 1
  });
  const [nationalities, setNationalities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingNationalities, setIsLoadingNationalities] = useState(true);
  const [user, setUser] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(false);

  // Enhanced authentication check
  const checkUserAuth = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser?.token) {
        const decoded = jwtDecode(storedUser.token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ 
            id: decoded.user_id || decoded.id, 
            token: storedUser.token,
            email: storedUser.email,
            name: storedUser.name 
          });
          return true;
        } else {
          // Token expired, remove it
          localStorage.removeItem("user");
          setUser(null);
          return false;
        }
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
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

  // Fetch nationalities from API
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/nationalities');
        if (response.ok) {
          const data = await response.json();
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
    
    // For guests input, ensure it's a number and within limits
    if (name === 'guests') {
      const guestCount = parseInt(value) || 1;
      // Limit guests to reasonable number (e.g., 1-10)
      if (guestCount >= 1 && guestCount <= 10) {
        setBookingData(prev => ({
          ...prev,
          [name]: guestCount
        }));
      }
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
      return;
    }

    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!bookingData.nationality) {
      setMessage("Please select your nationality");
      return false;
    }
    if (!bookingData.checkIn) {
      setMessage("Please select check-in date");
      return false;
    }
    if (!bookingData.checkOut) {
      setMessage("Please select check-out date");
      return false;
    }
    if (bookingData.guests < 1 || bookingData.guests > 10) {
      setMessage("Please enter a valid number of guests (1-10)");
      return false;
    }
    
    // Date validations
    const today = getTodayDate();
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const todayDate = new Date(today);

    // Check if check-in is today or in the future
    if (checkInDate < todayDate) {
      setMessage("Check-in date cannot be in the past");
      return false;
    }

    // Check if check-out is today or in the future
    if (checkOutDate < todayDate) {
      setMessage("Check-out date cannot be in the past");
      return false;
    }

    // Check if check-out is after check-in
    if (checkOutDate <= checkInDate) {
      setMessage("Check-out date must be after check-in date");
      return false;
    }

    // Check if stay is not too long (optional: you can remove this if not needed)
    const stayDuration = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
    if (stayDuration > 30) {
      setMessage("Maximum stay duration is 30 days");
      return false;
    }

    return true;
  };

  // Handle login popup
  const handleLoginPopup = () => {
    setPendingBooking(true);
    setMessage("Please log in to complete your booking");
    if (typeof onLoginClick === "function") {
      onLoginClick();
    } else {
      alert("Please log in to make a booking");
    }
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

    try {
      if (!user.token) {
        throw new Error('No authentication token found');
      }

      // Prepare the data to send to backend - matching BookingSearch format
      const bookingPayload = {
        booking: {
          user_id: user.id,
          nationality: bookingData.nationality,
          room_type: bookingData.roomType,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guests: bookingData.guests,
          room_id: room?.id,
          room_title: room?.title,
          price: room?.price
        }
      };

      const response = await fetch('http://localhost:3000/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("✅ Booking submitted successfully!");
        
        // Reset form
        setBookingData({
          nationality: "",
          roomType: room?.title || "",
          checkIn: getTodayDate(),
          checkOut: getTomorrowDate(),
          guests: 1
        });

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

  // Refresh authentication manually
  const refreshAuth = () => {
    checkUserAuth();
    setMessage("Authentication status refreshed");
  };

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
        {/* Auth Status Indicator */}
        <div className="max-w-7xl mx-auto pt-4 px-4 flex justify-between items-center">
          <div className="text-sm">
            {user ? (
              <span className="text-green-600">✅ Logged in as {user.name || user.email}</span>
            ) : (
              <span className="text-red-600">🔒 Please log in to book</span>
            )}
          </div>
          <button
            onClick={refreshAuth}
            className="text-xs bg-cyan-600 text-white px-2 py-1 rounded"
          >
            Refresh Auth
          </button>
        </div>

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

        {/* 🏨 Booking Component */}
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto border border-gray-400 flex flex-wrap bg-white shadow-md">
          <div className="flex-1 min-w-[180px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Guest Nationality *
            </label>
            <select 
              name="nationality"
              value={bookingData.nationality}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
            {isLoadingNationalities && (
              <p className="text-xs text-gray-500 mt-1">Loading nationalities...</p>
            )}
          </div>

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
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                required
              />
              <p className="text-xs text-gray-500 mt-1">Today or later</p>
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
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                required
              />
              <p className="text-xs text-gray-500 mt-1">After check-in</p>
            </div>
          </div>

          <div className="flex-1 min-w-[160px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Guests *
            </label>
            <input 
              type="number" 
              name="guests"
              min="1" 
              max="10"
              value={bookingData.guests}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" 
              required
            />
            <p className="text-xs text-gray-500 mt-1">1-10 guests</p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || (!user && pendingBooking)}
            className="rounded-2xl min-w-full md:min-w-[40px] flex items-center justify-center cursor-pointer transition text-white font-bold p-3 md:px-10 bg-cyan-300 hover:rounded-full hover:bg-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Login prompt for non-logged in users */}
        {!user && (
          <div className="max-w-7xl mx-auto mt-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
            <p className="font-semibold">Login Required</p>
            <p>You need to be logged in to make a booking.</p>
            <div className="mt-2 flex gap-4">
              <button 
                onClick={handleLoginPopup}
                className="text-cyan-600 hover:underline font-semibold"
              >
                Click here to login
              </button>
              <button 
                onClick={refreshAuth}
                className="text-gray-600 hover:underline text-sm"
              >
                Refresh status
              </button>
            </div>
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
              Discover the beauty of Kenya's coastline like never before. At South Coast Web,
              we make it easy for you to plan and enjoy unforgettable getaways filled with sun,
              sea, and adventure. From exclusive travel deals to inspiring destination highlights,
              we'll deliver the best offers straight to your inbox.
            </p>
            <p className="text-gray-700 text-left px-6 leading-relaxed mb-4">
              Whether it's flights, airport transfers, or exciting activities, we handle the
              details so you can focus on making lasting memories.
            </p>
            <button 
              onClick={user ? () => {} : handleLoginPopup}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
            >
              {user ? 'My Account' : 'Join Us'}
            </button>
          </div>

          {/* Right Section - Why South Coast */}
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Why South Coast Web?</h3>
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