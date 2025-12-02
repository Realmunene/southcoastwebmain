module Api
  module V1
    module Admin
      class BookingsController < ApplicationController
        before_action :authorize_admin!
        before_action :set_booking, only: [:show, :update, :destroy]

        # GET /api/v1/admin/bookings
        def index
          bookings = Booking.order(created_at: :desc)
          render json: bookings, status: :ok
        end

        # GET /api/v1/admin/bookings/:id
        def show
          render json: @booking, status: :ok
        end

        # POST /api/v1/admin/bookings
        def create
          booking = Booking.new(booking_params.merge(user_id: params[:user_id]))

          if booking.save
            send_mail_with_logging(:new_booking_notification, booking)
            render json: booking, status: :created
          else
            render json: { errors: booking.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PUT/PATCH /api/v1/admin/bookings/:id
        def update
          if @booking.update(booking_params)
            send_mail_with_logging(:update_booking_notification, @booking)
            render json: @booking, status: :ok
          else
            render json: { errors: @booking.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/admin/bookings/:id
        def destroy
          send_mail_with_logging(:cancel_booking_notification, @booking)
          @booking.destroy
          head :no_content
        end

        private

        def set_booking
          @booking = Booking.find(params[:id])
        end

        def booking_params
          params.require(:booking).permit(:user_id, :nationality, :room_type, :check_in, :check_out, :guests)
        end

        # Sends a mail asynchronously with logging
        def send_mail_with_logging(mailer_method, booking)
          BookingMailer.with(booking: booking).public_send(mailer_method).deliver_later
          Rails.logger.info "BookingMailer##{mailer_method} enqueued for Booking ID=#{booking.id}"
        rescue => e
          Rails.logger.error "Failed to enqueue BookingMailer##{mailer_method} for Booking ID=#{booking.id}: #{e.message}"
        end
      end
    end
  end
end
