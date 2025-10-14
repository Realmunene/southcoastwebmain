import React from 'react';
import { useRef } from "react";
import './Footer.css';
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
  {/* Section Header */}
  <div className="max-w-7xl mx-auto text-center mb-8">
    <h2 className="text-3xl font-bold text-black mb-2 text-left">
      Rates & Availability
    </h2>
    <p className="text-black">Seasonally Adjusted Packages</p>
  </div>
<div>  
  
</div>
  {/* Left Arrow */}
  <button
    onClick={scrollLeft}
    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700 shadow-md z-10"
  >
    &#8249;
  </button>

  {/* Cards Container */}
  <div
    ref={scrollRef}
    className="
      max-w-7xl mx-auto 
      grid
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-4
      grid-rows-2
      gap-6
      overflow-x-auto
      scroll-smooth
      snap-x
    "
    style={{ scrollBehavior: "smooth" }}
  >
    {packages.map((pkg, index) => (
      <div
  key={index}
  className="my-package relative rounded-xl shadow-md grid place-items-center hover:shadow-lg transition w-full h-64 snap-center overflow-hidden"
>
  {/* Top Title Overlay */}
  <div className="absolute top-0 left-0 bg-black/50 text-white px-3 py-2 rounded-br-lg backdrop-blur-sm">
    <h3 className="text-lg font-semibold">{pkg.title}</h3>
  </div>

  {/* Center Content (optional if you want something in the middle) */}
  <div className="text-center">
    <h1 className="text-2xl font-bold text-white">{pkg.centerText}</h1>
  </div>

  {/* Bottom Price & Button Overlay */}
  <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white px-4 py-3 flex justify-between items-center backdrop-blur-sm">
    <span className="text-lg font-bold text-cyan-400">{pkg.price}</span>
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
    &#8250;
  </button>
</section>

  )
}

export default Package
