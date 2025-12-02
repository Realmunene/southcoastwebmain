import React from "react";

// Helper to import all images dynamically
const importAll = (r) => r.keys().map(r);

const Gallery = () => {
  // Import all images from the folder
  const images = importAll(
    require.context("./images/Photos", false, /\.(png|jpe?g|svg)$/)
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <h1 className="text-4xl font-bold text-center w-full max-w-5xl px-5 mx-auto ">
        Our Gallery
      </h1>

      <div className="flex justify-center px-4 py-8">
        <div
          className="
            grid gap-4 
            lg:grid-cols-4 lg:grid-rows-2
            md:grid-cols-2 md:grid-rows-3 
            sm:grid-cols-1 sm:grid-rows-auto
            max-w-6xl w-full
          "
        >
          {images.map((src, index) => (
            <div
              key={index}
              className={`
                relative overflow-hidden rounded-lg
                ${index === 0 ? "lg:row-span-1 lg:col-span-1" : ""}
                ${index === 1 ? "lg:row-span-2 lg:col-span-1" : ""}
                ${index === 2 ? "lg:row-span-1 lg:col-span-1" : ""}
                ${index === 3 ? "lg:row-span-2 lg:col-span-1" : ""}
                ${index === 4 ? "lg:row-span-1 lg:col-span-1" : ""}
                ${index === 5 ? "lg:row-span-1 lg:col-span-1" : ""}
                ${index === 6 ? "lg:row-span-1 lg:col-span-1" : ""}
                ${index === 7 ? "lg:row-span-1 lg:col-span-1" : ""}
              `}
              style={{ minHeight: "200px" }} // ensures container has height
            >
              <img
                src={src}
                alt={`Gallery image ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
