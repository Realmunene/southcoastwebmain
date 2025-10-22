// RoomCarousel.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import room1 from "./images/Photos/image1.jpg";
import room2 from "./images/Photos/image2.jpg";
import room3 from "./images/Photos/image3.jpg";
import room4 from "./images/Photos/image4.jpg";
import room5 from "./images/Photos/image5.jpg";
import room6 from "./images/Photos/image6.jpg";
import room7 from "./images/Photos/image7.jpg";
import room8 from "./images/Photos/image8.jpg";

import house1 from "./images/ensuite.jpg";
import house2 from "./images/2 coneected.jpg";
import house3 from "./images/Apartment.jpg";
import house4 from "./images/2BA.jpg";
import house5 from "./images/Executive 2.jpg";
import house6 from "./images/2 connected room.jpg";
import house7 from "./images/2BA.jpg";
import house8 from "./images/LargerApartment.jpg";

const initialRooms = [
  { title: "Executive Room, Ensuite", price: "$75", image: [room1, house1] },
  { title: "2 Connected Room, 1 Ensuite", price: "$110", image: [room2, house2] },
  { title: "2 Bedroom Apartment - Living + Kitchen + 1 Ensuite", price: "$110", image: [room3, house3] },
  { title: "3 Bedroom Apartment - Kitchen, 2 Ensuites", price: "$125", image: [room4, house4] },
  { title: "Executive Room - Ensuite", price: "$75", image: [room5, house5] },
  { title: "2 Connected Room - 1 Ensuite", price: "$110", image: [room6, house6] },
  { title: "2 Bedroom Apartment - Kitchen - 1 Ensuite", price: "$125", image: [room7, house7] },
  { title: "Larger Apartment - Kitchen, Balcony, Living, 2 Ensuites", price: "$140", image: [room8, house8] },
];

export default function Package() {
  const [rooms, setRooms] = useState(initialRooms);
  const navigate = useNavigate();

  const handleNext = () => {
    setRooms((prev) => {
      const copy = [...prev];
      const first = copy.shift();
      copy.push(first);
      return copy;
    });
  };

  const handlePrev = () => {
    setRooms((prev) => {
      const copy = [...prev];
      const last = copy.pop();
      copy.unshift(last);
      return copy;
    });
  };

  const visibleRooms = rooms.slice(0, 4);

  const handleBookNow = (room) => {
    navigate(`/packagepage/${encodeURIComponent(room.title)}`, {
      state: { room },
    });
  };

  return (
    <div className="bg-gray-50 py-10 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Available Rooms</h2>

      <div className="relative max-w-7xl mx-auto">
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white p-2 rounded-full shadow"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {visibleRooms.map((room, idx) => (
            <div
              key={`${room.title}-${idx}`}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition flex flex-col"
            >
              <div className="h-44 md:h-48 w-full">
                <img
                  src={room.image[0]}  // ✅ FIX: use the first image
                  alt={room.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.title}</h3>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{room.price}</span>
                  <button
                    onClick={() => handleBookNow(room)}
                    className="bg-cyan-500 hover:bg-cyan-700 text-white px-3 py-1.5 rounded text-sm font-semibold"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={handleNext}
          className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white p-2 rounded-full shadow"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
