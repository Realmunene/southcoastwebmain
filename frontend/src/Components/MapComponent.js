import React, { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import house8 from "./images/LargerApartment.jpg";

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapComponent = () => {
  const position = [-4.267817, 39.59532];
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <MapContainer
        center={position}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          eventHandlers={{
            mouseover: () => setHover(true),
            mouseout: () => setHover(false),
          }}
        />
      </MapContainer>

      {/* Animated Popup Card */}
      <div
        style={{
          position: "absolute",
          bottom: hover ? "70px" : "40px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: hover ? 1 : 0,
          pointerEvents: "none",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "320px",
          maxWidth: "90%",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          overflow: "hidden",
          transition: "all 0.4s ease-in-out",
          zIndex: 1000,
        }}
      >
        {/* Image on Left */}
        <div style={{ flex: "0 0 40%" }}>
          <img
            src={house8}
            alt="SouthCoast Outdoors"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* Info on Right */}
        <div
          style={{
            flex: "1",
            padding: "10px",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h4
            style={{
              margin: "0 0 4px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            SouthCoast Outdoors
          </h4>
          <div style={{ color: "#FFD700", fontSize: "16px", marginBottom: "4px" }}>
            ★★★★★
          </div>
          <p style={{ fontSize: "13px", margin: 0 }}>
            <a
              href="tel:+254729491343"
              style={{
                display: "block",
                textDecoration: "none",
                color: "#007BFF",
                marginBottom: "3px",
              }}
            >
              📞 +254 729 491 343
            </a>
            <a
              href="mailto:southcoastoutdoors25@gmail.com"
              style={{
                textDecoration: "none",
                color: "#007BFF",
                wordBreak: "break-word",
              }}
            >
              ✉️ southcoastoutdoors25@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
