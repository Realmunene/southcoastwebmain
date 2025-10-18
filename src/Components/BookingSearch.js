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

  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const pendingBookingRef = useRef(false);

  // ✅ Initialize user on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.token) {
      try {
        const decoded = jwtDecode(storedUser.token);
        setUser({ id: decoded.user_id, token: storedUser.token });
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  // ✅ Listen for login in other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser?.token && !user) {
        try {
          const decoded = jwtDecode(storedUser.token);
          setUser({ id: decoded.user_id, token: storedUser.token });
        } catch (err) {
          console.error("Failed to decode token:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  // ✅ Handle pending booking after login
  useEffect(() => {
    if (user && pendingBookingRef.current) {
      pendingBookingRef.current = false;
      executeBooking(user.token, user.id);
    }
  }, [user]);

  // Fetch nationalities and room types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [natRes, roomRes] = await Promise.all([
          fetch("http://localhost:3000/api/v1/nationalities"),
          fetch("http://localhost:3000/api/v1/room_types"),
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

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const validateForm = () => {
    const newErrors = {};

    if (!selectedNationality) newErrors.selectedNationality = "Nationality is required";
    if (!selectedRoomType) newErrors.selectedRoomType = "Room type is required";
    if (!checkIn) newErrors.checkIn = "Check-in date is required";
    if (!checkOut) newErrors.checkOut = "Check-out date is required";
    if (!guests) newErrors.guests = "Number of guests is required";

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) newErrors.checkIn = "Check-in date cannot be in the past";
      if (checkOutDate <= checkInDate) newErrors.checkOut = "Check-out date must be after check-in date";
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

      const response = await fetch("http://localhost:3000/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message || "Booking successful!"}`);
        setSelectedNationality("");
        setSelectedRoomType("");
        setCheckIn("");
        setCheckOut("");
        setGuests("");
        setErrors({});
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

  // ✅ Simplified booking handler
  const handleBooking = () => {
    if (!user?.token || !user?.id) {
      pendingBookingRef.current = true;
      if (typeof onLoginClick === "function") onLoginClick();
      else alert("Please log in to make a booking");
      return;
    }
    executeBooking(user.token, user.id);
  };

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
        </div>

        {/* Dates */}
        <div className="flex-1 min-w-[280px] border-b md:border-b-0 md:border-r border-gray-300 p-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={getTodayDate()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setErrors((prev) => ({ ...prev, checkIn: "" }));
              }}
              className={getInputClass("checkIn")}
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || getTodayDate()}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setErrors((prev) => ({ ...prev, checkOut: "" }));
              }}
              className={getInputClass("checkOut")}
            />
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
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleBooking}
          disabled={loading}
          className={`min-w-full md:min-w-[40px] flex items-center justify-center cursor-pointer transition p-3 md:px-10 ${
            loading ? "bg-gray-400" : "bg-cyan-500 hover:bg-cyan-600"
          }`}
        >
          <FontAwesomeIcon icon={faSearch} className={`text-lg ${loading ? "text-gray-200" : "text-white"}`} />
          {loading && <span className="ml-2 text-white">Booking...</span>}
        </button>
      </div>

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
                className={`border-2 border-white text-sm font-medium py-2 px-6 rounded-full transition ${
                  loading ? "bg-gray-400 text-gray-200 border-gray-400" : "hover:bg-white hover:text-black text-white"
                }`}
              >
                {loading ? "BOOKING..." : "BOOK NOW"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
