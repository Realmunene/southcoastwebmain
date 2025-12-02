# app/controllers/api/v1/admin/payments_controller.rb
module Api
  module V1
    module Admin
      class PaymentsController < ApplicationController
        before_action :authenticate_admin
        before_action :verify_admin_access

        # GET /api/v1/admin/payments
        def index
          # Only select columns that actually exist in the bookings table
          payments = Booking.where.not(payment_status: nil)
                           .select(
                             :id, :payment_status, :mpesa_phone, :payment_amount,
                             :room_type, :check_in, :check_out, :created_at, :user_id
                           )
                           .order(created_at: :desc)

          render json: {
            success: true,
            payments: payments.as_json(include: { user: { only: [:id, :email, :name] } })
          }
        end

        # GET /api/v1/admin/payments/:id
        def show
          payment = Booking.find(params[:id])
          render json: {
            success: true,
            payment: payment.as_json(
              only: [
                :id, :payment_status, :mpesa_phone, :payment_amount,
                :room_type, :check_in, :check_out, :created_at
              ],
              include: { user: { only: [:id, :email, :name] } }
            )
          }
        rescue ActiveRecord::RecordNotFound
          render json: {
            success: false,
            error: 'Payment record not found'
          }, status: :not_found
        end

        # DELETE /api/v1/admin/payments/:id
        def destroy
          payment = Booking.find(params[:id])
          
          # Only clear fields that exist
          update_attributes = {
            mpesa_phone: nil,
            payment_amount: nil,
            payment_status: nil
          }
          
          # Only add these if the columns exist
          if Booking.column_names.include?('payment_method')
            update_attributes[:payment_method] = nil
          end
          
          if Booking.column_names.include?('payment_currency')
            update_attributes[:payment_currency] = nil
          end

          if payment.update(update_attributes)
            render json: {
              success: true,
              message: 'Payment record cleared successfully'
            }
          else
            render json: {
              success: false,
              errors: payment.errors.full_messages
            }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: {
            success: false,
            error: 'Payment record not found'
          }, status: :not_found
        end

        # GET /api/v1/admin/payments/export
        def export
          format = params[:format] || 'csv'
          payments = Booking.where.not(payment_status: nil)
                           .includes(:user)
                           .order(created_at: :desc)

          case format.downcase
          when 'csv'
            export_to_csv(payments)
          when 'json'
            export_to_json(payments)
          else
            render json: {
              success: false,
              error: 'Unsupported format. Use csv or json.'
            }, status: :unprocessable_entity
          end
        end

        # PATCH /api/v1/admin/bookings/:booking_id/payment_status
        def update_payment_status
          booking = Booking.find(params[:booking_id])

          if booking.update(payment_status: payment_status_params[:payment_status])
            render json: {
              success: true,
              message: 'Payment status updated successfully',
              booking: booking.as_json(
                only: [
                  :id, :payment_status, :mpesa_phone, :payment_amount,
                  :room_type, :check_in, :check_out, :created_at
                ],
                include: { user: { only: [:id, :email, :name] } }
              )
            }
          else
            render json: {
              success: false,
              errors: booking.errors.full_messages
            }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: {
            success: false,
            error: 'Booking not found'
          }, status: :not_found
        end

        private

        def authenticate_admin
          # Get the token from the Authorization header
          token = request.headers['Authorization']&.split(' ')&.last
          
          if token
            begin
              # Use ::Admin to reference the top-level Admin model, not Api::V1::Admin
              decoded_token = JWT.decode(token, Rails.application.secret_key_base)
              admin_id = decoded_token[0]['admin_id']
              @current_admin = ::Admin.find(admin_id)  # Note the :: prefix
            rescue JWT::DecodeError, ActiveRecord::RecordNotFound
              render json: {
                success: false,
                error: 'Invalid or expired token'
              }, status: :unauthorized
            end
          else
            render json: {
              success: false,
              error: 'Authorization token required'
            }, status: :unauthorized
          end
        end

        def verify_admin_access
          # Now we're using @current_admin instead of current_user
          unless @current_admin
            render json: {
              success: false,
              error: 'Authentication required'
            }, status: :unauthorized
            return
          end

          # For super admin access on certain actions
          if action_name == 'destroy' && !@current_admin.super_admin?
            render json: {
              success: false,
              error: 'Unauthorized. Super admin access required.'
            }, status: :forbidden
            return
          end

          # Regular admin can access other actions
          true
        end

        def payment_status_params
          params.require(:payment).permit(:payment_status)
        end

        def export_to_csv(payments)
          csv_data = CSV.generate(headers: true) do |csv|
            # Define headers based on available columns
            headers = [
              'Booking ID', 'User Email', 'Room Type', 'Check In', 'Check Out',
              'Payment Status', 'Phone', 'Amount', 'Created At'
            ]
            
            # Add optional columns if they exist
            if Booking.column_names.include?('payment_currency')
              headers.insert(8, 'Currency') # Insert before 'Created At'
            end
            
            if Booking.column_names.include?('payment_method')
              headers.insert(8, 'Method') # Insert before 'Currency' or 'Created At'
            end

            csv << headers

            payments.each do |payment|
              row = [
                payment.id,
                payment.user&.email,
                payment.room_type,
                payment.check_in,
                payment.check_out,
                payment.payment_status,
                payment.mpesa_phone,
                payment.payment_amount
              ]
              
              # Add optional fields if they exist
              if Booking.column_names.include?('payment_method')
                row << payment.payment_method
              end
              
              if Booking.column_names.include?('payment_currency')
                row << payment.payment_currency
              end
              
              row << payment.created_at

              csv << row
            end
          end

          send_data csv_data, filename: "payments-export-#{Date.today}.csv"
        end

        def export_to_json(payments)
          # Build the JSON structure based on available columns
          payment_data = payments.map do |payment|
            json_data = {
              id: payment.id,
              payment_status: payment.payment_status,
              mpesa_phone: payment.mpesa_phone,
              payment_amount: payment.payment_amount,
              room_type: payment.room_type,
              check_in: payment.check_in,
              check_out: payment.check_out,
              created_at: payment.created_at,
              user: { id: payment.user&.id, email: payment.user&.email, name: payment.user&.name }
            }
            
            # Add optional fields if they exist
            if Booking.column_names.include?('payment_method')
              json_data[:payment_method] = payment.payment_method
            end
            
            if Booking.column_names.include?('payment_currency')
              json_data[:payment_currency] = payment.payment_currency
            end
            
            json_data
          end

          render json: {
            success: true,
            payments: payment_data
          }
        end
      end
    end
  end
end