import React from "react";
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
export default function BookingSearch() {
  return (
    <div className= "my-background py-4">

      {/* Booking Bar Container */}
      <div className="max-w-7xl mx-auto border border-gray-400 flex flex-wrap items-center bg-white shadow-md">
        
        {/* Guest Nationality */}
        <div className="flex-1 min-w-[180px] border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Guest Nationality
          </label>
          <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
            <option>Kenya</option>
            <option>Tanzania</option>
            <option>Uganda</option>
            <option>Other</option>
          </select>
        </div>

        {/* Room Type */}
        <div className="flex-1 min-w-[220px] border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Room Type
          </label>
          <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
            <option>Select Room Type</option>
            <option>Executive Room, Ensuite ($75)</option>
            <option>2 Connected Rooms, 1 Ensuite ($110)</option>
            <option>Apartment – 2BR, 1 Ensuite ($110)</option>
            <option>Apartment – Kitchen, 2BR, 2 Ensuite ($125)</option>
            <option>Larger Apartment – Kitchen, Balcony, Living, 2 Ensuite ($140)</option>
          </select>
        </div>

        {/* Dates */}
        <div className="flex-1 min-w-[200px] border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Dates
          </label>
          <input
            type="text"
            placeholder="Check-in → Check-out"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Guests */}
        <div className="flex-1 min-w-[160px] border-r border-gray-300 p-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Guests
          </label>
          <input
            type="text"
            defaultValue="1 Adult"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Search Button */}
        
<div className="min-w-[40px] flex items-center justify-center cursor-pointer text-gray-700 hover:text-red-600 transition px-10">
          <FontAwesomeIcon icon={faSearch} className="text-lg" />
        </div>
      </div>
      <div className="py-20 text-4xl md:text-7xl font-extrabold text-center text-white text-shadow-lg/30">
         <h1 className="py-3">
             YOUR JOURNEY
        </h1>
        <h1 className="py-2">
            BEGINS WITH A STAY
        </h1>
        <div
      className="relative flex flex-col items-center justify-center  text-white text-center py-6"
    >
    
      {/* Content */}
      <div className="relative max-w-2xl">
        <p className="text-base md:text-lg font-normal font-sans mb-6 leading-relaxed">
          Just 300 meters from the beach, we offer the perfect escape with a refreshing pool, free parking,
           and 5 kitchens for self-cooking or a private chef. Enjoy thrilling adventures like kite surfing,
            snorkeling, scuba diving, dhow cruises, and safaris to national parks.
             Your unforgettable getaway starts here.
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
