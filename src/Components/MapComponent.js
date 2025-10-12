import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";

// 🧭 Custom marker icon fix for Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 🌍 Fallback location (e.g., Nairobi)
const fallbackCenter = {
  lat: -4.267817,
  lng: 39.595320,
};

const MapComponent = () => {
  const [position, setPosition] = useState(fallbackCenter);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation error, using fallback:", err);
          setPosition(fallbackCenter);
        }
      );
    } else {
      setPosition(fallbackCenter);
    }
  }, []);

  return (
    <div className="w-full h-[80vh]">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg shadow-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {`Latitude: ${position.lat.toFixed(4)}, Longitude: ${position.lng.toFixed(4)}`}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
