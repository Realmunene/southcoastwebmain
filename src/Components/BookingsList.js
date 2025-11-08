import React, { useState, useEffect } from "react";

export default function BookingsList({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetch(`http://127.0.0.1:3000/api/v1/bookings?user_id=${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError("Could not fetch bookings. Please try again later.");
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return <p className="text-red-500 text-center mt-4">Please log in to see your bookings.</p>;
  }

  if (loading) return <p className="text-center mt-4">Loading your bookings...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;
  if (bookings.length === 0) return <p className="text-center mt-4">You have no bookings yet.</p>;

  return (
    <div className="max-w-4xl mx-auto my-6 p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Booking ID</th>
            <th className="border border-gray-300 px-4 py-2">Nationality</th>
            <th className="border border-gray-300 px-4 py-2">Room Type</th>
            <th className="border border-gray-300 px-4 py-2">Check-in</th>
            <th className="border border-gray-300 px-4 py-2">Check-out</th>
            <th className="border border-gray-300 px-4 py-2">Guests</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{booking.id}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.nationality}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.room_type}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.check_in}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.check_out}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.guests}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
