import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import logo from "./images/IMG-20251008-WA0008logo0.png";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomPrices, setRoomPrices] = useState({});
  const [processingPayment, setProcessingPayment] = useState({});
  const [loadingRoomPrices, setLoadingRoomPrices] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loadingExchangeRate, setLoadingExchangeRate] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState({});
  const [pollingIntervals, setPollingIntervals] = useState({});

  useEffect(() => {
    fetchBookings();
    fetchRoomPrices();
    fetchExchangeRate();
    
    return () => {
      // Cleanup polling intervals on unmount
      Object.values(pollingIntervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  // Fetch real-time USD to KES exchange rate
  const fetchExchangeRate = async () => {
    try {
      setLoadingExchangeRate(true);
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      const kesRate = data.rates.KES;
      
      if (!kesRate) {
        throw new Error('KES rate not available');
      }
      
      setExchangeRate(kesRate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(130);
    } finally {
      setLoadingExchangeRate(false);
    }
  };

  // Fetch room prices from API
  const fetchRoomPrices = async () => {
    try {
      setLoadingRoomPrices(true);
      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/room_types");
      
      if (!response.ok) {
        throw new Error('Failed to fetch room prices');
      }
      
      const roomTypes = await response.json();
      const prices = {};
      roomTypes.forEach(room => {
        prices[room.name] = room.price;
      });
      setRoomPrices(prices);
    } catch (error) {
      console.error("Error fetching room prices:", error);
      setError("Awaiting response from server for room prices");
    } finally {
      setLoadingRoomPrices(false);
    }
  };

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

  // Convert USD to KES
  const convertToKES = (usdAmount) => {
    if (!exchangeRate || !usdAmount) return 0;
    return Math.round(usdAmount * exchangeRate);
  };

  // Calculate total price based on room price, number of adults, and duration
  const calculateTotalPrice = (booking) => {
    const roomPriceUSD = roomPrices[booking.room_type];
    if (!roomPriceUSD) return null;

    const roomPriceKES = convertToKES(roomPriceUSD);
    const numberOfNights = Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24));
    const totalPriceKES = roomPriceKES * numberOfNights;
    
    return {
      roomPriceUSD,
      roomPriceKES,
      numberOfNights,
      totalPriceKES,
      pricePerNightKES: roomPriceKES
    };
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });

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
        alert("Booking cancelled successfully! Cancellation emails have been sent to you and the admin.");
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

  // Handle M-Pesa payment with admin approval flow
  const handleMpesaPayment = async (bookingId, amount) => {
    const phone = prompt("Please enter your M-Pesa phone number (format: 2547XXXXXXXX):");
    
    if (!phone) {
      alert("Payment cancelled. Phone number is required.");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^254[17]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid M-Pesa phone number in format 2547XXXXXXXX");
      return;
    }

    setProcessingPayment(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/bookings/${bookingId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser.token}`,
        },
        body: JSON.stringify({
          payment: {
            phone: phone,
            amount: amount,
            payment_status: 'pending' // Set initial status as pending
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const data = await response.json();
      
      alert("Payment initiated successfully! Your payment status is now 'Pending'. Please wait for admin confirmation. You'll be notified when your payment status is updated.");
      
      // Start polling for payment status updates
      startPaymentStatusPolling(bookingId);
      
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert(error.message || "Failed to initiate payment. Please try again.");
    } finally {
      setProcessingPayment(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Poll for payment status updates
  const startPaymentStatusPolling = (bookingId) => {
    const interval = setInterval(async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });

        if (response.ok) {
          const booking = await response.json();
          
          // If payment status is no longer pending, stop polling and refresh bookings
          if (booking.payment_status && booking.payment_status !== 'pending') {
            clearInterval(interval);
            setPollingIntervals(prev => {
              const newIntervals = { ...prev };
              delete newIntervals[bookingId];
              return newIntervals;
            });
            fetchBookings(); // Refresh to get updated status
            
            if (booking.payment_status === 'partial_paid') {
              alert("Your payment has been marked as 'Partial Paid' by the admin. Thank you!");
            } else if (booking.payment_status === 'payment_made') {
              alert("Your payment has been confirmed as 'Payment Made' by the admin. Thank you for your payment!");
            }
          }
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 5000); // Poll every 5 seconds

    setPollingIntervals(prev => ({ ...prev, [bookingId]: interval }));
  };

  // Calculate total guests from adults and children
  const calculateTotalGuests = (adults, children) => {
    return (parseInt(adults) || 0) + (parseInt(children) || 0);
  };

  // Generate PDF for booking
  const generateBookingPDF = async (booking) => {
    setGeneratingPDF(prev => ({ ...prev, [booking.id]: true }));
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add logo at top center
      if (logo) {
        pdf.addImage(logo, 'PNG', pageWidth / 2 - 25, 15, 50, 20);
      }
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("My Bookings", pageWidth / 2, 45, { align: "center" });
      
      // Add welcome message
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Thank you for choosing our hotel! We are delighted to confirm your booking", pageWidth / 2, 55, { align: "center" });
      pdf.text("and look forward to welcoming you. Below are your booking details:", pageWidth / 2, 60, { align: "center" });
      
      // Booking details section
      let yPosition = 80;
      
      // Booking ID and Status
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Booking Confirmation: #${booking.id}`, 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      // Room Type
      pdf.text(`Room Type: ${booking.room_type}`, 20, yPosition);
      yPosition += 8;
      
      // Dates
      pdf.text(`Check-in: ${formatDate(booking.check_in)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Check-out: ${formatDate(booking.check_out)}`, 20, yPosition);
      yPosition += 8;
      
      // Duration
      const priceDetails = calculateTotalPrice(booking);
      if (priceDetails) {
        pdf.text(`Duration: ${priceDetails.numberOfNights} nights`, 20, yPosition);
        yPosition += 8;
      }
      
      // Guests
      const totalGuests = calculateTotalGuests(booking.adults, booking.children);
      pdf.text(`Guests: ${totalGuests} (${booking.adults || 1} adults, ${booking.children || 0} children)`, 20, yPosition);
      yPosition += 8;
      
      // Nationality
      pdf.text(`Nationality: ${booking.nationality || 'Not specified'}`, 20, yPosition);
      yPosition += 15;
      
      // Price breakdown
      if (priceDetails) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Price Breakdown:", 20, yPosition);
        yPosition += 8;
        pdf.setFont("helvetica", "normal");
        
        pdf.text(`Room Price: $${priceDetails.roomPriceUSD} USD (KES ${priceDetails.roomPriceKES} per night)`, 20, yPosition);
        yPosition += 8;
        
        pdf.text(`Total Nights: ${priceDetails.numberOfNights}`, 20, yPosition);
        yPosition += 8;
        
        if (parseInt(booking.children) > 0) {
          pdf.setTextColor(255, 140, 0);
          pdf.text(`* Children charges to be discussed upon arrival`, 20, yPosition);
          yPosition += 8;
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.setFont("helvetica", "bold");
        pdf.text(`Total Amount: KES ${priceDetails.totalPriceKES}`, 20, yPosition);
        yPosition += 15;
      }
      
      // Payment Status
      const paymentStatus = booking.payment_status || 'pending';
      let statusColor = [0, 0, 0]; // Default black
      let statusText = 'PENDING';
      
      if (paymentStatus === 'partial_paid') {
        statusColor = [255, 140, 0]; // Orange
        statusText = 'PARTIAL PAID';
      } else if (paymentStatus === 'payment_made') {
        statusColor = [0, 128, 0]; // Green
        statusText = 'PAYMENT MADE';
      } else {
        statusColor = [255, 0, 0]; // Red
        statusText = 'PENDING';
      }
      
      pdf.setTextColor(...statusColor);
      pdf.text(`Payment Status: ${statusText}`, 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;
      
      // Booking Date
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Booking created on: ${new Date(booking.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}`, 20, yPosition);
      yPosition += 10;
      
      // Footer note
      pdf.text("Please present this confirmation at check-in. For any queries, contact our front desk.", 20, pageHeight - 20);
      
      // Save the PDF
      pdf.save(`booking-confirmation-${booking.id}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  // Helper function to get payment status display
  const getPaymentStatusDisplay = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return { text: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' };
      case 'partial_paid':
        return { text: 'Partial Paid', color: 'bg-blue-100 text-blue-800' };
      case 'payment_made':
        return { text: 'Payment Made', color: 'bg-green-100 text-green-800' };
      default:
        return { text: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' };
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
        
        {/* Exchange Rate Display */}
        {exchangeRate && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">Current Exchange Rate</p>
                <p className="text-blue-600 text-sm">1 USD = {exchangeRate} KES</p>
              </div>
              <button
                onClick={fetchExchangeRate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Refresh Rate
              </button>
            </div>
          </div>
        )}

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
            {bookings.map((booking) => {
              const priceDetails = calculateTotalPrice(booking);
              const totalGuests = calculateTotalGuests(booking.adults, booking.children);
              const hasChildren = parseInt(booking.children) > 0;
              const paymentStatus = booking.payment_status || 'pending';
              const isProcessing = processingPayment[booking.id];
              const hasRoomPrice = roomPrices[booking.room_type];
              const isGeneratingPDF = generatingPDF[booking.id];
              const paymentStatusDisplay = getPaymentStatusDisplay(paymentStatus);
              const isPaid = paymentStatus === 'partial_paid' || paymentStatus === 'payment_made';

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{booking.room_type}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>Booking ID: #{booking.id}</span>
                          {getStatusBadge(booking.check_in, booking.check_out)}
                          <span className={`${paymentStatusDisplay.color} text-xs font-medium px-2.5 py-0.5 rounded`}>
                            {paymentStatusDisplay.text}
                          </span>
                        </div>
                        
                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
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
                            <div className="flex flex-col">
                              <span>Adults: {booking.adults || 1}</span>
                              <span>Children: {booking.children || 0}</span>
                              <span className="font-medium mt-1">
                                Total: {totalGuests} guests
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Nationality:</span>
                            <p>{booking.nationality || 'Not specified'}</p>
                          </div>
                        </div>

                        {/* Stay Duration */}
                        <div className="mb-3">
                          <span className="font-medium text-gray-900">Stay Duration: </span>
                          <span className="text-gray-600">
                            {priceDetails ? priceDetails.numberOfNights : 'Calculating...'} nights
                          </span>
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">Price Breakdown:</h4>
                          
                          {loadingRoomPrices || loadingExchangeRate ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
                              <p className="text-gray-500 mt-2">
                                {loadingRoomPrices ? 'Loading room prices...' : 'Fetching exchange rate...'}
                              </p>
                            </div>
                          ) : !hasRoomPrice || !exchangeRate ? (
                            <div className="text-center py-4">
                              <p className="text-amber-600 font-medium">
                                {!hasRoomPrice ? 'Awaiting response from server for room prices' : 'Unable to fetch exchange rate'}
                              </p>
                              <div className="flex space-x-2 justify-center mt-2">
                                {!hasRoomPrice && (
                                  <button
                                    onClick={fetchRoomPrices}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm"
                                  >
                                    Retry Room Prices
                                  </button>
                                )}
                                {!exchangeRate && (
                                  <button
                                    onClick={fetchExchangeRate}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm"
                                  >
                                    Retry Exchange Rate
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Room price (USD):</span>
                                <span>${priceDetails.roomPriceUSD} per night</span>
                              </div>
                              
                              <div className="flex justify-between text-green-600">
                                <span>Converted to KES:</span>
                                <span>KES {priceDetails.roomPriceKES} per night</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span>{priceDetails.numberOfNights} nights</span>
                              </div>

                              {hasChildren && (
                                <div className="flex justify-between text-amber-600 bg-amber-50 p-2 rounded">
                                  <span className="font-medium">Children charges:</span>
                                  <span className="font-medium">To be discussed upon arrival</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="font-medium text-lg">Total Price (KES):</span>
                                <span className="text-lg font-semibold text-cyan-600">
                                  KES {priceDetails.totalPriceKES}
                                </span>
                              </div>

                              {hasChildren && (
                                <div className="text-xs text-amber-600 mt-1">
                                  * Final total may vary based on children charges discussed at check-in
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Booking Date */}
                        <div className="mt-4 text-xs text-gray-500">
                          Booked on: {new Date(booking.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                        {!hasRoomPrice || !exchangeRate || loadingRoomPrices || loadingExchangeRate ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-400 text-gray-200 rounded-md text-sm font-medium cursor-not-allowed"
                          >
                            {loadingRoomPrices || loadingExchangeRate ? 'Loading...' : 'Awaiting Price Information'}
                          </button>
                        ) : !isPaid ? (
                          <button
                            onClick={() => handleMpesaPayment(booking.id, priceDetails.totalPriceKES)}
                            disabled={isProcessing}
                            className={`px-4 py-2 rounded-md transition text-sm font-medium ${
                              isProcessing
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {isProcessing ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Initiating...
                              </div>
                            ) : (
                              `Pay KES ${priceDetails.totalPriceKES} via M-Pesa`
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className={`px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed ${
                              paymentStatus === 'partial_paid' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {paymentStatus === 'partial_paid' ? '✅ Partial Payment Made' : '✅ Payment Made'}
                          </button>
                        )}
                        
                        {/* Updated cancellation button - disabled when payment is made */}
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={isPaid}
                          className={`px-4 py-2 border rounded-md transition text-sm font-medium ${
                            isPaid
                              ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                              : 'border-red-300 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {isPaid ? 'Cancellation Not Available' : 'Cancel Booking'}
                        </button>

                        {/* Download PDF button - appears when payment is partial or full */}
                        {isPaid && (
                          <button
                            onClick={() => generateBookingPDF(booking)}
                            disabled={isGeneratingPDF}
                            className={`px-4 py-2 rounded-md transition text-sm font-medium ${
                              isGeneratingPDF
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                            }`}
                          >
                            {isGeneratingPDF ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating PDF...
                              </div>
                            ) : (
                              'Download Booking PDF'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}