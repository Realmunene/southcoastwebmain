// PackagePage.js
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import Package from "./Package"; 
import { Link } from "react-router-dom";

export default function PackagePage() {
  const { roomTitle } = useParams();
  const location = useLocation();
  const room = location.state?.room;

  // If user comes directly without state (refresh or direct URL)
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <p>Room information not available. Please return to the rooms page.</p>
      </div>
    );
  }

  return (
    <div>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section: title with first image as background */}
      <div
        className="relative h-80 flex items-center justify-center text-white"
        style={{
          backgroundImage: `url(${room.image[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative text-3xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">
          {room.title}
        </h1>
      </div>
{/* 🏨 Booking Component */}
                        <div class="max-w-7xl mx-auto border border-gray-400 flex flex-wrap bg-white shadow-md">
                    <div class="flex-1 min-w-[180px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">
                        Guest Nationality
                        </label>
                        <select class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="">Select Nationality</option>
                        </select>
                    </div>

                    <div class="flex-1 min-w-[200px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">
                        Room Type
                        </label>
                        <button class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        <option value="">{room.title}</option>
                        </button>
                    </div>

                    <div class="flex-1 min-w-[280px] border-b md:border-b-0 md:border-r border-gray-300 p-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div class="w-full sm:w-1/2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">
                            Check-in
                        </label>
                        <input type="date" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                        </div>
                        <div class="w-full sm:w-1/2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">
                            Check-out
                        </label>
                        <input type="date" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                        </div>
                    </div>

                    <div class="flex-1 min-w-[160px] border-b md:border-b-0 md:border-r border-gray-300 p-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">
                        Guests
                        </label>
                        <input type="number" min="1" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                    </div>

                    <button type="button" class=" rounded-2xl min-w-full md:min-w-[40px] flex items-center justify-center cursor-pointer transition text-white font-bold p-3 md:px-10 bg-cyan-300 hover:rounded-full hover:bg-cyan-200">
                    Submit
                    </button>
                    </div>
      {/* Below section: second image on the left, title on the right */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left: second image */}
        <div>
          <img
            src={room.image[1]}
            alt={room.title}
            className="rounded-l-2xl w-full h-auto  shadow-lg object-cover"
          />
        </div>

        {/* Right: details */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">{room.title}</h2>
          <p className="text-gray-700 mb-4">
            Enjoy our luxurious {room.title} with modern amenities, elegant interiors,
            and a peaceful environment perfect for both business and leisure stays.
          </p>
          <p className="text-lg font-semibold text-cyan-600 mb-6">
            Price: {room.price} / night
          </p>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg font-semibold">
            Proceed to Booking
          </button>
        </div>
      </div>
    </div>
     {/* 🧳 Packages Section */}
      <div className=" px-4 py-10">
        <Package />
      </div>
      <div className="w-full bg-cyan-200 py-14 p-auto flex text-center ">
        <div className="  flex justify-between flex-col md:flex-row gap-10">
          {/* Left Section - Join Us */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">
              Join the South Coast Experience
            </h2>
            <p className="text-gray-700 text-left px-6 leading-relaxed mb-4">
              Discover the beauty of Kenya’s coastline like never before. At South Coast Web,
              we make it easy for you to plan and enjoy unforgettable getaways filled with sun,
              sea, and adventure. From exclusive travel deals to inspiring destination highlights,
              we’ll deliver the best offers straight to your inbox.
            </p>
            <p className="text-gray-700 text-left px-6 leading-relaxed mb-4">
              Whether it’s flights, airport transfers, or exciting activities, we handle the
              details so you can focus on making lasting memories.
            </p>
            <Link
            to='/firstlogin'
            >
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md">
              Join Us
            </button>
            </Link>
          </div>

          {/* Right Section - Why South Coast */}
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Why South Coast Web?</h3>
            <ul className="space-y-3 text-gray-700 px-6">
              <li className="">✅ Tailor-made holiday experiences</li>
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
