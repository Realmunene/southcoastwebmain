import React, { useState, useEffect } from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function BookingSearch() {
  // State for dropdown data
  const [nationalities, setNationalities] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  // State for user selections
  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [dates, setDates] = useState("");
  const [guests, setGuests] = useState("1 Adult");

  // Fetch dropdown data
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3000/api/v1/nationalities");
        if (!response.ok) throw new Error("Failed to fetch nationalities");
        const data = await response.json();
        setNationalities(data);
      } catch (error) {
        console.error("Error fetching nationalities:", error);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/room_types");
        if (!response.ok) throw new Error("Failed to fetch room types");
        const data = await response.json();
        setRoomTypes(data);
      } catch (error) {
        console.error("Error fetching room types:", error);
      }
    };

    fetchNationalities();
    fetchRoomTypes();
  }, []);

  // Handle form submission
  const handleSearch = async () => {
    const bookingData = {
      nationality: selectedNationality,
      room_type: selectedRoomType,
      dates,
      guests,
    };

    try {
      const response = await fetch("http://localhost:3000/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error("Failed to submit booking data");

      const result = await response.json();
      alert("Booking search submitted successfully!");
      console.log("Booking response:", result);
    } catch (error) {
      console.error("Error submitting booking data:", error);
      alert("Failed to submit booking. Please try again.");
    }
  };

  return (
    <div className="my-background py-4">
      {/* Booking Bar Container */}
      <div className="max-w-7xl mx-auto border border-gray-400 flex flex-col md:flex-row flex-wrap items-stretch bg-white shadow-md">

        {/* Guest Nationality */}
        <div className="flex-1 min-w-full md:min-w-[180px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Guest Nationality
          </label>
          <select
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="">Select Nationality</option>
            {nationalities.map((nat, index) => (
              <option key={index} value={nat.name || nat}>
                {nat.name || nat}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type */}
        <div className="flex-1 min-w-full md:min-w-[220px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Room Type
          </label>
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="">Select Room Type</option>
            {roomTypes.map((room, index) => (
              <option key={index} value={room.name || room}>
                {room.name || room}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="flex-1 min-w-full md:min-w-[200px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Dates
          </label>
          <input
            type="text"
            placeholder="Check-in → Check-out"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Guests */}
        <div className="flex-1 min-w-full md:min-w-[160px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Guests
          </label>
          <input
            type="text"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Search Button */}
        <div
          onClick={handleSearch}
          className="min-w-full md:min-w-[40px] flex items-center justify-center cursor-pointer text-gray-700 hover:text-red-600 transition p-3 md:px-10 bg-cyan-500"
        >
          <FontAwesomeIcon icon={faSearch} className="text-lg text-white" />
        </div>
      </div>

      {/* Hero Text Section */}
      <div className="py-20 text-4xl md:text-7xl font-extrabold text-center text-white text-shadow-lg/30">
        <h1 className="py-3">YOUR JOURNEY</h1>
        <h1 className="py-2">BEGINS WITH A STAY</h1>

        <div className="relative flex flex-col items-center justify-center text-white text-center py-6">
          {/* Content */}
          <div className="relative max-w-2xl">
            <p className="text-base md:text-lg font-normal font-sans mb-6 leading-relaxed">
              Just 300 meters from the beach, we offer the perfect escape with a
              refreshing pool, free parking, and 5 kitchens for self-cooking or
              a private chef. Enjoy thrilling adventures like kite surfing,
              snorkeling, scuba diving, dhow cruises, and safaris to national
              parks. Your unforgettable getaway starts here.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#learn-more"
                className="bg-cyan-500 hover:bg-blue-700 text-white text-sm font-medium py-2 px-6 rounded-full transition"
              >
                LEARN MORE
              </a>
              <a
                href="#book-now"
                className="border-2 border-white hover:bg-white hover:text-black text-white text-sm font-medium py-2 px-6 rounded-full transition"
              >
                BOOK NOW
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
