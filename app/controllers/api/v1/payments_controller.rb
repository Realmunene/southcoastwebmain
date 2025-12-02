# app/controllers/api/v1/payments_controller.rb
module Api
  module V1
    class PaymentsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_booking, only: [:create, :update_payment_status]

      # POST /api/v1/bookings/:id/payments
      def create
        # Validate phone number format
        phone = payment_params[:phone]
        unless phone&.match?(/\A254[17]\d{8}\z/)
          return render json: {
            success: false,
            error: "Invalid phone number format. Please use format: 2547XXXXXXXX"
          }, status: :unprocessable_entity
        end

        if @booking.update(
          mpesa_phone: phone,
          payment_amount: payment_params[:amount],
          payment_status: 'pending'
        )
          render json: {
            success: true,
            message: 'Payment initiated successfully. Awaiting admin confirmation.',
            booking: @booking.as_json(only: [:id, :payment_status, :mpesa_phone, :payment_amount])
          }
        else
          render json: {
            success: false,
            errors: @booking.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/bookings/:id/payments/status
      def update_payment_status
        # Check if current user is admin
        unless current_user&.super_admin?
          return render json: { 
            success: false,
            error: 'Unauthorized. Admin access required.' 
          }, status: :forbidden
        end

        if @booking.update(payment_status: payment_status_params[:payment_status])
          render json: {
            success: true,
            message: 'Payment status updated successfully',
            booking: @booking.as_json(only: [:id, :payment_status, :mpesa_phone, :payment_amount, :room_type, :check_in, :check_out, :created_at])
          }
        else
          render json: {
            success: false,
            errors: @booking.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      private

      def set_booking
        @booking = Booking.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: 'Booking not found'
        }, status: :not_found
      end

      def payment_params
        # Handle both nested and flat parameter structures
        if params[:payment]
          params.require(:payment).permit(:phone, :amount)
        else
          params.permit(:phone, :amount)
        end
      end

      def payment_status_params
        params.require(:payment).permit(:payment_status)
      end
    end
  end
end