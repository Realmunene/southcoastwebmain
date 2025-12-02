# app/mailers/booking_mailer.rb
class BookingMailer < ApplicationMailer
  default from: 'no-reply@southcoastoutdoors.cloud'

  # Sent to the user who made the booking
  def new_booking_notification
    @booking = params[:booking]
    @user = @booking.user

    mail(
      to: @user.email,
      subject: "Booking Confirmation - South Coast Web Main"
    )
  end

  # Sent to the admin when a new booking is created
  def admin_booking_notification
    @booking = params[:booking]

    mail(
      to: "joseph.m.munene690@gmail.com",
      subject: "New Booking Received - #{@booking.room_type}"
    )
  end

  # Sent when a booking is updated
  def update_booking_notification
    @booking = params[:booking]

    mail(
      to: @booking.user.email,
      subject: "Booking Updated - #{@booking.room_type}"
    )
  end

  # ✅ Sent when a booking is cancelled (after deletion)
  def cancel_booking_notification
    @booking_details = params[:booking_details]

    mail(
      to: @booking_details[:user_email],
      subject: "Booking Cancelled - #{@booking_details[:room_type]}"
    )
  end

  # ✅ Sent to admin when a booking is cancelled
  def admin_cancellation_notification
    @booking_details = params[:booking_details]

    mail(
      to: "joseph.m.munene690@gmail.com",
      subject: "Booking Cancelled (##{@booking_details[:id]}) - #{@booking_details[:room_type]}"
    )
  end
end
