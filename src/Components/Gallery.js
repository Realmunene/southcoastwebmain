import React from 'react';

const Gallery = () => {
  const images = [
    {
      id: 1,
      src: '/images/IMG-20251008-WA0005.jpg',
      alt: 'Kitchen',
      title: 'Front view',
      description: 'All in one kitchen'
    },
    {
      id: 2,
      src: '/images/IMG-20251008-WA0006.jpg',
      alt: 'Wash rooms',
      title: 'Our Wash rooms',
      description: 'Always Clean'
    },
    {
      id: 3,
      src: '/images/IMG-20251008-WA0007.jpg',
      alt: 'Outside view',
      title: 'Outside view',
      description: 'Serene view of our Hotel'
    },
    {
      id: 4,
      src: '/images/IMG-20251008-WA0009.jpg',
      alt: 'Forest Path',
      title: 'Forest Trail',
      description: 'Serene forest path through dense trees'
    },
  ];

  return (
    <div className="w-full bg-gray-50 py-12 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-800 mb-3 text-left ">Our Gallery</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Explore our collection of stunning images from around the world
        </p>
      </div>

      {/* Grid layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition group"
          >
            {/* Image */}
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <button className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100">
                View
              </button>
            </div>

            {/* Info section */}
            <div className="p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">{image.title}</h3>
              <p className="text-gray-600 text-sm">{image.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;

