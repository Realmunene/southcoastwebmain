import React, { useState, useEffect } from "react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.token) {
        setError("Please log in to view your bookings");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/v1/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser.token}`, // ✅ Send JWT
        },
      });

      if (!response.ok) {
        if (response.status === 401) setError("Unauthorized. Please log in again.");
        else throw new Error(`Failed to fetch bookings: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getStatusBadge = (checkIn, checkOut) => {
    const today = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (today < checkInDate)
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Upcoming</span>;
    else if (today >= checkInDate && today <= checkOutDate)
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>;
    else
      return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`http://localhost:3000/api/v1/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${storedUser.token}`, // ✅ Send JWT
        },
      });

      if (response.ok) {
        alert("Booking cancelled successfully!");
        fetchBookings();
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Bookings</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-4">You haven't made any reservations yet.</p>
            <button
              onClick={() => window.location.href = "/"}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md transition"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{booking.room_type} Room</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>Booking ID: #{booking.id}</span>
                      {getStatusBadge(booking.check_in, booking.check_out)}
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-3">
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
