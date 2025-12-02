# app/controllers/api/v1/admins_controller.rb
module Api
  module V1
    class AdminsController < ApplicationController
      # POST /api/v1/admin/forgot-password
      def forgot_password
        # Use the correct Admin model from the global namespace
        admin = ::Admin.find_by(email: params[:email])
        
        if admin
          # Generate password reset token
          token = SecureRandom.urlsafe_base64
          
          # Store token in the database if you have the columns
          # For now, we'll use a class variable for testing
          @@reset_tokens ||= {}
          @@reset_tokens[token] = {
            admin_id: admin.id,
            sent_at: Time.current
          }
          
          # Build the reset URL
          # In production, use your frontend URL
          reset_url = if Rails.env.development?
            "https://southcoastoutdoors.cloud/admin/reset-password?token=#{token}"
          else
            "#{request.base_url}/admin/reset-password?token=#{token}"
          end
          
          # Send password reset email
          AdminMailer.password_reset(admin, reset_url).deliver_later
          
          render json: { 
            status: 'success',
            message: 'Password reset instructions sent to your email.'
          }, status: :ok
        else
          render json: { 
            status: 'error',
            message: 'Email not found in our system.'
          }, status: :not_found
        end
      end
      
      # POST /api/v1/admin/reset-password
      def reset_password
        # Get token data from class variable
        @@reset_tokens ||= {}
        token_data = @@reset_tokens[params[:token]]
        
        if token_data && token_data[:sent_at] > 1.hour.ago
          # Find admin by ID from token data
          admin = ::Admin.find_by(id: token_data[:admin_id])
          
          if admin && params[:password] && params[:password_confirmation]
            # Update the password
            admin.password = params[:password]
            admin.password_confirmation = params[:password_confirmation]
            
            if admin.save
              # Remove used token
              @@reset_tokens.delete(params[:token])
              
              render json: { 
                status: 'success',
                message: 'Password has been reset successfully.'
              }, status: :ok
            else
              render json: { 
                status: 'error',
                message: admin.errors.full_messages.join(', ')
              }, status: :unprocessable_entity
            end
          else
            render json: { 
              status: 'error',
              message: 'Invalid password data or admin not found.'
            }, status: :unprocessable_entity
          end
        else
          render json: { 
            status: 'error',
            message: 'Invalid or expired reset token.'
          }, status: :unprocessable_entity
        end
      end
    end
  end
end