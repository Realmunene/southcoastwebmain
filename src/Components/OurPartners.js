import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function OurPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3000/api/v1/partners", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setPartners(data.partners);
        } else {
          setError(data.message || "Failed to fetch partners");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching partners");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading partners...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <Link
    to="/ourpartners"
    >
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Our Partners</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col"
          >
            <h2 className="font-semibold text-xl mb-2">{partner.supplier_name}</h2>
            <p className="text-gray-700 mb-1">
              <strong>Type:</strong> {partner.supplier_type}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Contact:</strong> {partner.contact_person}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Email:</strong> {partner.email}
            </p>
            <p className="text-gray-700">
              <strong>City:</strong> {partner.city}
            </p>
          </div>
        ))}
      </div>
    </div>
    </Link>
  );
}
