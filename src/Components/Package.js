import React from 'react';
import { useRef } from "react";
const packages = [
  { title: "Executive Room, Ensuite", price: "$75" },
  { title: "2 Connected Room, 1 Ensuite", price: "$110" },
  { title: "Apartment - 2BR + Living + 1 Ensuite", price: "$110" },
  { title: "Apartment - Kitchen 2BR, 2 Ensuites", price: "$125" },
  { title: "Executive Room - Ensuite", price: "$75" },
  { title: "2 Connected Room - 1 Ensuite", price: "$110" },
  { title: "Apartment - Kitchen 2BR - 1 Ensuite", price: "$125" },
  { title: "Larger Apartment - Kitchen, Balcony, Living, 2 Ensuites", price: "$140" },
];
const Package = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };
  return (
   <section className="w-full bg-cyan-50 py-12 px-4 relative">
      <div className="max-w-7xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-500 mb-2 text-left">Rates & Availability</h2>
        <p className="text-cyan-600">Seasonally Adjusted Packages</p>
      </div>

      {/* Left Arrow */}
      <button
        onClick={scrollLeft}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700 shadow-md z-10"
      >
        &#8249;
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex flex-wrap gap-6 max-w-7xl mx-auto overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        {packages.map((pkg, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition w-[280px] flex-shrink-0 snap-center"
          >
            <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYQbpmvNCbJvJNhCUlFEIhnP9BB-VVrH2-eg&s'/>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{pkg.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-cyan-600">{pkg.price}</span>
              <button className="bg-cyan-600 text-white text-sm px-4 py-2 rounded-full hover:bg-cyan-700 transition">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700 shadow-md z-10"
      >
      </button>
    </section>
  )
}

export default Package
