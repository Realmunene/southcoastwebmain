# app/controllers/api/v1/bookings_controller.rb
module Api
  module V1
    class BookingsController < ApplicationController
      before_action :authorize_user!
      before_action :set_booking, only: [:show, :destroy]

      # GET /api/v1/bookings
      def index
        bookings = current_user.bookings.order(created_at: :desc)
        render json: bookings, status: :ok
      end

      # GET /api/v1/bookings/:id
      def show
        render json: @booking, status: :ok
      end

      # POST /api/v1/bookings
      def create
        @booking = current_user.bookings.new(booking_params)

        if @booking.save
          send_emails(@booking)
          render json: @booking, status: :created
        else
          render json: { errors: @booking.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/bookings/:id
      def destroy
        # Capture details before destroying the record
        booking_details = {
          id: @booking.id,
          nationality: @booking.nationality,
          room_type: @booking.room_type,
          check_in: @booking.check_in,
          check_out: @booking.check_out,
          adults: @booking.adults,
          children: @booking.children,
          user_email: @booking.user.email,
          created_at: @booking.created_at
        }

        if @booking.destroy
          send_cancellation_emails(booking_details)
          render json: { message: 'Booking deleted successfully' }, status: :ok
        else
          render json: { errors: 'Failed to delete booking' }, status: :unprocessable_entity
        end
      rescue => e
        Rails.logger.error "Failed to send cancellation emails: #{e.message}"
        render json: {
          message: 'Booking deleted successfully, but failed to send cancellation emails',
          warning: 'Emails not sent due to server error'
        }, status: :ok
      end

      private

      def set_booking
        @booking = current_user.bookings.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Booking not found' }, status: :not_found
      end

      def booking_params
        params.require(:booking).permit(:nationality, :room_type, :check_in, :check_out, :adults, :children)
      end

      # ✅ Send confirmation and admin notification emails
      def send_emails(booking)
        BookingMailer.with(booking: booking).new_booking_notification.deliver_later
        BookingMailer.with(booking: booking).admin_booking_notification.deliver_later
        Rails.logger.info "📧 BookingMailer notifications enqueued for Booking ID=#{booking.id}"
      rescue => e
        Rails.logger.error "❌ Failed to enqueue BookingMailer notifications: #{e.message}"
      end

      # ✅ Send cancellation emails using static data hash
      def send_cancellation_emails(booking_details)
        BookingMailer.with(booking_details: booking_details).cancel_booking_notification.deliver_later
        BookingMailer.with(booking_details: booking_details).admin_cancellation_notification.deliver_later
        Rails.logger.info "📧 Booking cancellation emails enqueued for Booking ID=#{booking_details[:id]}"
      rescue => e
        Rails.logger.error "❌ Failed to enqueue BookingMailer cancellation emails: #{e.message}"
      end
    end
  end
end
