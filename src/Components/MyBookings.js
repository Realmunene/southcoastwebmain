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

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser.token}`,
        },
      });

      // First get response as text to check if it's valid JSON
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      if (!response.ok) {
        if (response.status === 401) setError("Unauthorized. Please log in again.");
        else throw new Error(data.error || data.message || `Failed to fetch bookings: ${response.status}`);
        setLoading(false);
        return;
      }

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      
      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else if (err.message.includes("Server returned an invalid response")) {
        setError("Server error: The backend is not responding properly. Please try again later.");
      } else {
        setError(err.message || "Failed to load bookings");
      }
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
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });

      // First get response as text to check if it's valid JSON
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Server Response:", responseText.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      if (response.ok) {
        alert("Booking cancelled successfully!");
        fetchBookings();
      } else {
        throw new Error(data.error || data.message || "Failed to cancel booking");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check your internet connection.");
      } else if (err.message.includes("Server returned an invalid response")) {
        alert("Server error: The backend is not responding properly. Please try again later.");
      } else {
        alert("Failed to cancel booking. Please try again.");
      }
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
          <div className="flex space-x-3 justify-center">
            <button
              onClick={fetchBookings}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
            >
              Go Home
            </button>
          </div>
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
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{booking.room_type} Room</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>Booking ID: #{booking.id}</span>
                        {getStatusBadge(booking.check_in, booking.check_out)}
                      </div>
                      
                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium text-gray-900">Check-in:</span>
                          <p>{formatDate(booking.check_in)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Check-out:</span>
                          <p>{formatDate(booking.check_out)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Guests:</span>
                          <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Nationality:</span>
                          <p>{booking.nationality || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {/* Price and additional info if available */}
                      {(booking.price || booking.total_price) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-900">Total Price:</span>
                          <p className="text-lg font-semibold text-cyan-600">
                            {booking.total_price || booking.price} {booking.currency || ''}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-3">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition text-sm font-medium"
                      >
                        Cancel Booking
                      </button>
                    </div>
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