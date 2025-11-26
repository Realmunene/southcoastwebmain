import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import logo from "./images/IMG-20251008-WA0008logo0.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTimes, faCreditCard, faSync, faHome, faExclamationTriangle, faCheckCircle, faClock, faReceipt, faCalendarDay } from "@fortawesome/free-solid-svg-icons";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentErrors, setPaymentErrors] = useState({});
  const phoneInputRef = useRef(null);

  // Production API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:3000/api/v1';

  useEffect(() => {
    fetchBookings();
    fetchRoomPrices();
    fetchExchangeRate();
    
    return () => {
      Object.values(pollingIntervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  // Fetch exchange rate
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
      console.warn("Using fallback exchange rate:", error);
      setExchangeRate(130);
    } finally {
      setLoadingExchangeRate(false);
    }
  };

  // Fetch room prices
  const fetchRoomPrices = async () => {
    try {
      setLoadingRoomPrices(true);
      const response = await fetch(`${API_BASE_URL}/room_types`);
      
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

      const response = await fetch(`${API_BASE_URL}/bookings`, {
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
        throw new Error("Server returned an invalid response. Please check if the backend is running properly.");
      }

      if (!response.ok) {
        if (response.status === 401) setError("Unauthorized. Please log in again.");
        else throw new Error(data.error || data.message || `Failed to fetch bookings: ${response.status}`);
        setLoading(false);
        return;
      }

      const bookingsData = Array.isArray(data) ? data : [];
      setBookings(bookingsData);

      // FIX: Restart polling for any bookings that are still pending
      bookingsData.forEach(booking => {
        if (booking.payment_status === 'pending' && !pollingIntervals[booking.id]) {
          console.log(`🔄 Restarting polling for booking ${booking.id}`);
          startPaymentStatusPolling(booking.id);
        }
      });

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
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Upcoming</span>;
    else if (today >= checkInDate && today <= checkOutDate)
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Active</span>;
    else
      return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">Completed</span>;
  };

  // Convert USD to KES
  const convertToKES = (usdAmount) => {
    if (!exchangeRate || !usdAmount) return 0;
    return Math.round(usdAmount * exchangeRate);
  };

  // Calculate total price
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
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
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

  // Enhanced Phone Number Validation with Better Formatting
  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneRegex = /^(?:254|\+254|0)?(7[0-9]{8})$/;
    const match = cleanPhone.match(phoneRegex);
    
    if (!match) {
      return { isValid: false, error: "Please enter a valid Kenyan phone number starting with 07 or 254" };
    }
    
    const formattedPhone = `254${match[1]}`;
    
    return { 
      isValid: true, 
      formattedPhone,
      error: null 
    };
  };

  // Enhanced Phone Number Formatting for Display
  const formatPhoneDisplay = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('254') && cleanPhone.length === 12) {
      return `254 ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 9)} ${cleanPhone.slice(9)}`;
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
    } else if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
      return `0${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    }
    
    return phone;
  };

  // FIXED: Enhanced Phone Number Input Handler - No more single digit issue
  const handlePhoneNumberChange = (value) => {
    // Store current cursor position
    const cursorPosition = phoneInputRef.current?.selectionStart || 0;
    
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    
    let formatted = digitsOnly;
    
    // Handle different starting formats
    if (digitsOnly.startsWith('0') && digitsOnly.length <= 10) {
      formatted = digitsOnly;
    } else if (digitsOnly.startsWith('254') && digitsOnly.length <= 12) {
      formatted = digitsOnly;
    } else if (digitsOnly.startsWith('7') && digitsOnly.length <= 9) {
      formatted = `0${digitsOnly}`;
    } else if (digitsOnly.length > 0) {
      formatted = `0${digitsOnly.slice(-9)}`;
    }
    
    // Limit length based on format
    if (formatted.length > (formatted.startsWith('254') ? 12 : 10)) {
      formatted = formatted.slice(0, formatted.startsWith('254') ? 12 : 10);
    }
    
    setPhoneNumber(formatted);
    
    // Clear phone errors when user starts typing
    if (paymentErrors.phone) {
      setPaymentErrors(prev => ({ ...prev, phone: null }));
    }

    // Restore cursor position after state update
    setTimeout(() => {
      if (phoneInputRef.current) {
        const newCursorPosition = Math.min(cursorPosition, formatted.length);
        phoneInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // Payment amount validation
  const validatePaymentAmount = (amount, maxAmount) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { isValid: false, error: "Please enter a valid payment amount" };
    }
    
    if (numAmount > maxAmount) {
      return { 
        isValid: false, 
        error: `Payment amount cannot exceed KES ${maxAmount.toLocaleString()}` 
      };
    }
    
    if (numAmount < 10) {
      return { 
        isValid: false, 
        error: "Minimum payment amount is KES 10" 
      };
    }
    
    return { isValid: true, error: null };
  };

  // Enhanced Amount Input Handler
  const handleAmountChange = (value) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setPaymentAmount(cleanValue);
    
    if (paymentErrors.amount) {
      setPaymentErrors(prev => ({ ...prev, amount: null }));
    }
  };

  // Open payment modal
  const openPaymentModal = (booking, totalAmount) => {
    setCurrentBooking(booking);
    setPaymentAmount(totalAmount.toString());
    setPhoneNumber("");
    setPaymentErrors({});
    setShowPaymentModal(true);
  };

  // Close payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setCurrentBooking(null);
    setPaymentAmount("");
    setPhoneNumber("");
    setPaymentErrors({});
  };

  // FIXED: Handle M-Pesa payment with corrected parameters
  const handleMpesaPayment = async () => {
    if (!currentBooking) return;

    setPaymentErrors({});
    
    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      setPaymentErrors({ phone: phoneValidation.error });
      return;
    }

    // Validate payment amount
    const currentBookingPriceDetails = getCurrentBookingPriceDetails();
    if (!currentBookingPriceDetails) {
      setPaymentErrors({ amount: "Unable to calculate booking amount" });
      return;
    }

    const amountValidation = validatePaymentAmount(
      paymentAmount, 
      currentBookingPriceDetails.totalPriceKES
    );
    
    if (!amountValidation.isValid) {
      setPaymentErrors({ amount: amountValidation.error });
      return;
    }

    setProcessingPayment(prev => ({ ...prev, [currentBooking.id]: true }));
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      if (!storedUser?.token) {
        throw new Error("Authentication required. Please log in again.");
      }

      // FIXED: Remove unpermitted parameters that were causing server warnings
      const paymentData = {
        payment: {
          phone: phoneValidation.formattedPhone,
          amount: parseFloat(paymentAmount)
        }
      };

      console.log("Initiating M-Pesa payment:", paymentData);

      const response = await fetch(`${API_BASE_URL}/bookings/${currentBooking.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser.token}`,
        },
        body: JSON.stringify(paymentData),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Invalid response from payment server");
      }

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.error || "Invalid payment request");
        } else if (response.status === 402) {
          throw new Error(data.error || "Payment failed. Please check your M-Pesa balance and try again.");
        } else if (response.status === 422) {
          throw new Error(data.error || "Payment validation failed");
        } else if (response.status === 429) {
          throw new Error("Too many payment attempts. Please try again in a few minutes.");
        } else {
          throw new Error(data.error || `Payment failed: ${response.status}`);
        }
      }

      // Payment initiated successfully
      console.log("Payment initiated successfully:", data);

      // Update local state to show "Waiting for Admin Confirmation"
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === currentBooking.id 
            ? { ...booking, payment_status: 'pending' }
            : booking
        )
      );

      // Show success message
      alert("Payment initiated successfully! Please check your phone to complete the M-Pesa transaction. Your payment status is now 'Waiting for Admin Confirmation'.");
      
      closePaymentModal();
      
      // Start polling for payment status updates
      startPaymentStatusPolling(currentBooking.id);
      
    } catch (error) {
      console.error("Payment initiation error:", error);
      setPaymentErrors({ 
        general: error.message || "Failed to initiate payment. Please try again." 
      });
    } finally {
      setProcessingPayment(prev => ({ ...prev, [currentBooking.id]: false }));
    }
  };

  // FIXED: Enhanced Payment Status Polling that properly detects admin updates
  const startPaymentStatusPolling = (bookingId) => {
    console.log(`🚀 Starting payment status polling for booking ${bookingId}`);
    
    // Clear any existing interval for this booking
    if (pollingIntervals[bookingId]) {
      clearInterval(pollingIntervals[bookingId]);
    }

    let retryCount = 0;
    const maxRetries = 360; // 30 minutes (360 * 5 seconds)

    const interval = setInterval(async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.token) {
          console.warn("User token not available, stopping polling");
          clearInterval(interval);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });

        if (response.ok) {
          const updatedBooking = await response.json();
          
          // FIX: Get current booking from state to compare
          const currentBooking = bookings.find(b => b.id === bookingId);
          const currentStatus = currentBooking?.payment_status || 'pending';
          const newStatus = updatedBooking.payment_status || 'pending';
          
          console.log(`📡 Polling booking ${bookingId}:`, {
            currentStatus,
            newStatus, 
            retryCount
          });
          
          // If payment status changed from pending to something else (admin action)
          if (newStatus !== currentStatus && currentStatus === 'pending' && newStatus !== 'pending') {
            console.log(`🎉 Admin updated payment status for booking ${bookingId}:`, { 
              from: currentStatus, 
              to: newStatus 
            });
            
            clearInterval(interval);
            
            // Remove from polling intervals
            setPollingIntervals(prev => {
              const newIntervals = { ...prev };
              delete newIntervals[bookingId];
              return newIntervals;
            });
            
            // Update the booking with the new status from backend
            setBookings(prevBookings => 
              prevBookings.map(b => 
                b.id === bookingId 
                  ? { ...b, payment_status: newStatus }
                  : b
              )
            );
            
            // Show appropriate message based on new status
            if (newStatus === 'partial_paid') {
              alert("✅ Partial payment confirmed! Thank you for your payment. The remaining balance will be due before check-in.");
            } else if (newStatus === 'payment_made') {
              alert("✅ Payment confirmed! Your booking is now fully paid. Thank you for your business!");
            }
          } 
          // If status is still pending, continue polling
          else if (newStatus === 'pending') {
            retryCount++;
            console.log(`⏳ Still waiting for admin confirmation for booking ${bookingId}, retry ${retryCount}`);
            
            if (retryCount >= maxRetries) {
              console.log(`⏹️ Max retries reached for booking ${bookingId}, stopping polling`);
              clearInterval(interval);
              setPollingIntervals(prev => {
                const newIntervals = { ...prev };
                delete newIntervals[bookingId];
                return newIntervals;
              });
              
              alert("⏳ Payment confirmation is taking longer than expected. Please check back later or contact support for updates.");
            }
          }
          // If status changed but we're not in pending state (shouldn't happen normally)
          else if (newStatus !== currentStatus) {
            console.log(`🔄 Status changed for booking ${bookingId}:`, { from: currentStatus, to: newStatus });
            
            // Update state anyway
            setBookings(prevBookings => 
              prevBookings.map(b => 
                b.id === bookingId 
                  ? { ...b, payment_status: newStatus }
                  : b
              )
            );
            
            clearInterval(interval);
            setPollingIntervals(prev => {
              const newIntervals = { ...prev };
              delete newIntervals[bookingId];
              return newIntervals;
            });
          }
        } else {
          console.warn(`Failed to fetch booking ${bookingId} status: ${response.status}`);
          retryCount++;
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          clearInterval(interval);
          setPollingIntervals(prev => {
            const newIntervals = { ...prev };
            delete newIntervals[bookingId];
            return newIntervals;
          });
          
          alert("⚠️ Unable to check payment status. Please refresh the page to check for updates.");
        }
      }
    }, 5000); // Poll every 5 seconds

    // Store the interval
    setPollingIntervals(prev => ({ 
      ...prev, 
      [bookingId]: interval 
    }));
  };

  // Calculate total guests
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
      
      // Add logo
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
      
      // Booking details
      let yPosition = 80;
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Booking Confirmation: #${booking.id}`, 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      pdf.text(`Room Type: ${booking.room_type}`, 20, yPosition);
      yPosition += 8;
      
      pdf.text(`Check-in: ${formatDate(booking.check_in)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Check-out: ${formatDate(booking.check_out)}`, 20, yPosition);
      yPosition += 8;
      
      const priceDetails = calculateTotalPrice(booking);
      if (priceDetails) {
        pdf.text(`Duration: ${priceDetails.numberOfNights} nights`, 20, yPosition);
        yPosition += 8;
      }
      
      const totalGuests = calculateTotalGuests(booking.adults, booking.children);
      pdf.text(`Guests: ${totalGuests} (${booking.adults || 1} adults, ${booking.children || 0} children)`, 20, yPosition);
      yPosition += 8;
      
      pdf.text(`Nationality: ${booking.nationality || 'Not specified'}`, 20, yPosition);
      yPosition += 15;
      
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
      
      const paymentStatus = booking.payment_status || 'pending';
      let statusColor = [0, 0, 0];
      let statusText = 'PENDING';
      
      if (paymentStatus === 'partial_paid') {
        statusColor = [255, 140, 0];
        statusText = 'PARTIAL PAID';
      } else if (paymentStatus === 'payment_made') {
        statusColor = [0, 128, 0];
        statusText = 'PAYMENT MADE';
      } else if (paymentStatus === 'pending') {
        statusColor = [255, 165, 0];
        statusText = 'WAITING FOR ADMIN CONFIRMATION';
      } else {
        statusColor = [255, 0, 0];
        statusText = 'PENDING PAYMENT';
      }
      
      pdf.setTextColor(...statusColor);
      pdf.text(`Payment Status: ${statusText}`, 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;
      
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
      
      pdf.text("Please present this confirmation at check-in. For any queries, contact our front desk.", 20, pageHeight - 20);
      
      pdf.save(`booking-confirmation-${booking.id}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  // Helper function for payment status display
  const getPaymentStatusDisplay = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return { 
          text: 'Waiting for Admin Confirmation', 
          color: 'bg-orange-100 text-orange-800', 
          icon: faClock 
        };
      case 'partial_paid':
        return { 
          text: 'Partial Paid', 
          color: 'bg-blue-100 text-blue-800', 
          icon: faCheckCircle 
        };
      case 'payment_made':
        return { 
          text: 'Payment Made', 
          color: 'bg-green-100 text-green-800', 
          icon: faCheckCircle 
        };
      default:
        return { 
          text: 'Pending Payment', 
          color: 'bg-amber-100 text-amber-800', 
          icon: faClock 
        };
    }
  };

  // Enhanced Quick Amount Buttons
  const quickAmountButtons = (totalAmount) => [
    { label: "25%", value: Math.max(10, Math.round(totalAmount * 0.25)) },
    { label: "50%", value: Math.round(totalAmount * 0.5) },
    { label: "75%", value: Math.round(totalAmount * 0.75) },
    { label: "Full Amount", value: totalAmount }
  ];

  // Calculate price details for current booking
  const getCurrentBookingPriceDetails = () => {
    if (!currentBooking) return null;
    return calculateTotalPrice(currentBooking);
  };

  // Enhanced Payment Modal Component with Fixed Issues
  const PaymentModal = () => {
    const currentBookingPriceDetails = getCurrentBookingPriceDetails();
    
    if (!showPaymentModal || !currentBooking || !currentBookingPriceDetails) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <h3 className="text-2xl font-bold text-gray-900">
              Make M-Pesa Payment
            </h3>
            <button
              onClick={closePaymentModal}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              disabled={processingPayment[currentBooking?.id]}
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          
          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Display */}
            {paymentErrors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                  <p className="text-red-700 font-medium">{paymentErrors.general}</p>
                </div>
              </div>
            )}

            {/* Fixed Phone Number Input - No more single digit issue */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                {/* Country Code Badge */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-l-lg border-r border-gray-300">
                  <span className="text-sm font-medium text-gray-700">KE</span>
                  <span className="text-sm text-gray-500">+254</span>
                </div>
                
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="numeric"
                  placeholder="0722 123 456"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  disabled={processingPayment[currentBooking?.id]}
                  className={`w-full pl-24 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    paymentErrors.phone 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                  } ${processingPayment[currentBooking?.id] ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              
              {paymentErrors.phone ? (
                <div className="flex items-center gap-2 mt-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-sm" />
                  <p className="text-red-600 text-sm font-medium">{paymentErrors.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-xs mt-2">
                  Enter your Safaricom M-Pesa number. Examples: 0722 123 456, 254 722 123 456
                </p>
              )}
            </div>

            {/* Enhanced Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Payment Amount
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-700 font-medium">KES</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  disabled={processingPayment[currentBooking?.id]}
                  className={`w-full pl-14 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    paymentErrors.amount 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                  } ${processingPayment[currentBooking?.id] ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              
              {paymentErrors.amount && (
                <div className="flex items-center gap-2 mt-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-sm" />
                  <p className="text-red-600 text-sm font-medium">{paymentErrors.amount}</p>
                </div>
              )}
              
              {/* Enhanced Quick Amount Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {quickAmountButtons(currentBookingPriceDetails.totalPriceKES).map((button, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPaymentAmount(button.value.toString())}
                    disabled={processingPayment[currentBooking?.id]}
                    className="px-4 py-3 text-sm bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 text-cyan-700 border border-cyan-200 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                  >
                    {button.label}
                    <div className="text-xs text-cyan-600 mt-1">
                      KES {button.value.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Total Amount Info */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-cyan-800">Total Booking Amount:</span>
                <span className="text-lg font-bold text-cyan-600">
                  KES {currentBookingPriceDetails.totalPriceKES.toLocaleString()}
                </span>
              </div>
              {parseFloat(paymentAmount) < currentBookingPriceDetails.totalPriceKES && parseFloat(paymentAmount) > 0 && (
                <div className="mt-3 pt-3 border-t border-cyan-200">
                  <div className="flex justify-between items-center text-amber-600">
                    <span className="text-sm font-medium">Remaining Balance:</span>
                    <span className="text-sm font-bold">
                      KES {(currentBookingPriceDetails.totalPriceKES - parseFloat(paymentAmount)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faCreditCard} />
                Payment Instructions:
              </h4>
              <ol className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  Enter your M-Pesa registered phone number
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  Enter the payment amount or use quick buttons
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  Click "Pay KES Y" to receive M-Pesa prompt
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  Enter your M-Pesa PIN when prompted
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                  Wait for admin confirmation (status updates automatically)
                </li>
              </ol>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={closePaymentModal}
              disabled={processingPayment[currentBooking?.id]}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleMpesaPayment}
              disabled={processingPayment[currentBooking?.id] || !phoneNumber || !paymentAmount}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {processingPayment[currentBooking?.id] ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Initiating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCreditCard} />
                  Pay KES {parseFloat(paymentAmount || 0).toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-red-800 font-bold text-xl mb-2">Error Loading Bookings</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={fetchBookings}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSync} />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faHome} />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600 text-lg">Manage your reservations and payments in one place</p>
        </div>
        
        {/* Exchange Rate Display */}
        {exchangeRate && (
          <div className="mb-8 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faReceipt} className="text-cyan-600 text-xl" />
                </div>
                <div>
                  <p className="text-cyan-800 font-semibold">Current Exchange Rate</p>
                  <p className="text-cyan-600">1 USD = {exchangeRate} KES</p>
                </div>
              </div>
              <button
                onClick={fetchExchangeRate}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSync} />
                Refresh Rate
              </button>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faReceipt} className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings yet</h3>
            <p className="text-gray-500 mb-8 text-lg">You haven't made any reservations yet.</p>
            <button
              onClick={() => window.location.href = "/"}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
              const paymentStatus = booking.payment_status || 'not_paid';
              const isProcessing = processingPayment[booking.id];
              const hasRoomPrice = roomPrices[booking.room_type];
              const isGeneratingPDF = generatingPDF[booking.id];
              const paymentStatusDisplay = getPaymentStatusDisplay(paymentStatus);
              const isPaid = paymentStatus === 'partial_paid' || paymentStatus === 'payment_made';
              const isWaitingForAdmin = paymentStatus === 'pending';
              const isNotPaid = paymentStatus === 'not_paid' || !paymentStatus;

              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        {/* Header with Room Type and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">{booking.room_type}</h3>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(booking.check_in, booking.check_out)}
                            <span className={`${paymentStatusDisplay.color} text-xs font-medium px-3 py-1 rounded-full flex items-center gap-2`}>
                              <FontAwesomeIcon icon={paymentStatusDisplay.icon} className="text-xs" />
                              {paymentStatusDisplay.text}
                            </span>
                          </div>
                        </div>
                        
                        {/* Booking ID */}
                        <div className="mb-6">
                          <span className="text-sm font-medium text-gray-500">Booking ID: </span>
                          <span className="text-sm font-semibold text-cyan-600">#{booking.id}</span>
                        </div>
                        
                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faCalendarDay} className="text-cyan-600 text-sm" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Check-in</p>
                                <p className="text-gray-600">{formatDate(booking.check_in)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faCalendarDay} className="text-cyan-600 text-sm" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Check-out</p>
                                <p className="text-gray-600">{formatDate(booking.check_out)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faReceipt} className="text-cyan-600 text-sm" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Guests</p>
                                <div className="text-gray-600">
                                  <span className="block">Adults: {booking.adults || 1}</span>
                                  <span className="block">Children: {booking.children || 0}</span>
                                  <span className="block font-medium mt-1">Total: {totalGuests}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faReceipt} className="text-cyan-600 text-sm" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Nationality</p>
                                <p className="text-gray-600">{booking.nationality || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stay Duration */}
                        <div className="mb-4">
                          <span className="font-medium text-gray-900">Stay Duration: </span>
                          <span className="text-cyan-600 font-semibold">
                            {priceDetails ? priceDetails.numberOfNights : 'Calculating...'} nights
                          </span>
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-4 text-lg">Price Breakdown</h4>
                          
                          {loadingRoomPrices || loadingExchangeRate ? (
                            <div className="text-center py-6">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                              <p className="text-gray-500 mt-3 font-medium">
                                {loadingRoomPrices ? 'Loading room prices...' : 'Fetching exchange rate...'}
                              </p>
                            </div>
                          ) : !hasRoomPrice || !exchangeRate ? (
                            <div className="text-center py-6 bg-amber-50 rounded-xl p-4">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 text-2xl mb-3" />
                              <p className="text-amber-700 font-medium mb-4">
                                {!hasRoomPrice ? 'Awaiting response from server for room prices' : 'Unable to fetch exchange rate'}
                              </p>
                              <div className="flex space-x-3 justify-center">
                                {!hasRoomPrice && (
                                  <button
                                    onClick={fetchRoomPrices}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl font-semibold transition-all duration-300"
                                  >
                                    Retry Room Prices
                                  </button>
                                )}
                                {!exchangeRate && (
                                  <button
                                    onClick={fetchExchangeRate}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl font-semibold transition-all duration-300"
                                  >
                                    Retry Exchange Rate
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">Room price (USD):</span>
                                <span className="font-semibold">${priceDetails.roomPriceUSD} per night</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-green-600">
                                <span>Converted to KES:</span>
                                <span className="font-semibold">KES {priceDetails.roomPriceKES} per night</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span>Duration:</span>
                                <span className="font-semibold">{priceDetails.numberOfNights} nights</span>
                              </div>

                              {hasChildren && (
                                <div className="flex justify-between items-center bg-amber-100 rounded-xl p-4">
                                  <span className="font-medium text-amber-700">Children charges:</span>
                                  <span className="font-medium text-amber-700">To be discussed upon arrival</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center pt-4 border-t border-cyan-200">
                                <span className="text-xl font-bold text-gray-900">Total Price (KES):</span>
                                <span className="text-2xl font-bold text-cyan-600">
                                  KES {priceDetails.totalPriceKES}
                                </span>
                              </div>

                              {hasChildren && (
                                <div className="text-sm text-amber-600 mt-2">
                                  * Final total may vary based on children charges discussed at check-in
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Booking Date */}
                        <div className="mt-6 text-sm text-gray-500">
                          Booked on: {new Date(booking.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="lg:w-64 flex flex-col space-y-4">
                        {!hasRoomPrice || !exchangeRate || loadingRoomPrices || loadingExchangeRate ? (
                          <button
                            disabled
                            className="w-full px-6 py-4 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                          >
                            {loadingRoomPrices || loadingExchangeRate ? 'Loading...' : 'Awaiting Price Information'}
                          </button>
                        ) : isNotPaid ? (
                          // Not paid state - show payment button
                          <button
                            onClick={() => openPaymentModal(booking, priceDetails.totalPriceKES)}
                            disabled={isProcessing}
                            className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                              isProcessing
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Initiating...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faCreditCard} />
                                Pay KES {priceDetails.totalPriceKES}
                              </>
                            )}
                          </button>
                        ) : isWaitingForAdmin ? (
                          // Waiting for admin confirmation state - show disabled button
                          <button
                            disabled
                            className="w-full px-6 py-4 bg-orange-100 text-orange-800 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-3"
                          >
                            <FontAwesomeIcon icon={faClock} />
                            Waiting for Admin Confirmation
                          </button>
                        ) : isPaid ? (
                          // Paid state - show appropriate paid button (disabled)
                          <button
                            disabled
                            className={`w-full px-6 py-4 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-3 ${
                              paymentStatus === 'partial_paid' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            <FontAwesomeIcon icon={faCheckCircle} />
                            {paymentStatus === 'partial_paid' ? 'Partial Payment Made' : 'Payment Made'}
                          </button>
                        ) : null}
                        
                        {/* Cancellation button */}
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={isWaitingForAdmin || isPaid}
                          className={`w-full px-6 py-4 border rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                            isWaitingForAdmin || isPaid
                              ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                              : 'border-red-300 text-red-600 hover:bg-red-50 hover:scale-105'
                          }`}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                          {isWaitingForAdmin || isPaid ? 'Cancellation Not Available' : 'Cancel Booking'}
                        </button>

                        {/* Download PDF button - Only visible when paid */}
                        {isPaid && (
                          <button
                            onClick={() => generateBookingPDF(booking)}
                            disabled={isGeneratingPDF}
                            className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                              isGeneratingPDF
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {isGeneratingPDF ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faDownload} />
                                Download PDF
                              </>
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

        {/* Payment Modal */}
        <PaymentModal />
      </div>
    </div>
  );
}