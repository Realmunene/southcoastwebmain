import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "80vh", // full width and large height
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return (
    <div className="w-full">
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        {currentPosition && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition}
            zoom={15}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            <Marker position={currentPosition} />
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
};

export default MapComponent;
