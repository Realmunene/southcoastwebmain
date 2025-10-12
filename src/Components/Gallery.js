import React, { useEffect, useState } from "react";

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          "https://api.pexels.com/v1/search?query=travel&per_page=8",
          {
            headers: {
              Authorization: "a0Obt8PFa18GfMvCnd4fDnUgS8YVEPJkkFDbM8a06QYXlQU42W6cjpZM",
            },
          }
        );

        const data = await response.json();
        setImages(data.photos);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  return (
<div>
        <h1 className="text-left m-4 p-4 text-xl font-bold">
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
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`
              overflow-hidden rounded-lg
              ${index === 0 ? "lg:row-span-1 lg:col-span-1" : ""}
              ${index === 1 ? "lg:row-span-2 lg:col-span-1" : ""}
              ${index === 2 ? "lg:row-span-1 lg:col-span-1" : ""}
              ${index === 3 ? "lg:row-span-2 lg:col-span-1" : ""}
              ${index === 4 ? "lg:row-span-1 lg:col-span-1" : ""}
              ${index === 5 ? "lg:row-span-1 lg:col-span-1" : ""}
              ${index === 6 ? "lg:row-span-1 lg:col-span-1" : ""}
              ${index === 7 ? "lg:row-span-1 lg:col-span-1" : ""}
            `}
          >
            <img
              src={img.src.large}
              alt={img.photographer}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Gallery;
