# app/controllers/api/v1/users_controller.rb
module Api
  module V1
    class UsersController < ApplicationController
      # Remove both skip_before_action lines - they're causing errors
      # skip_before_action :authorize_request, only: [:login, :create, :forgot_password, :reset_password]
      # skip_before_action :authenticate_user!, only: [:create, :forgot_password, :reset_password]

      # POST /api/v1/users (registration)
      def create
        user = User.new(user_params)
        if user.save
          render json: { message: "User created successfully", user: user }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/user/forgot-password
      def forgot_password
        user = User.find_by(email: params[:email])
        
        if user
          # Generate password reset token
          user.generate_password_reset_token!
          
          # Send password reset email
          UserMailer.password_reset(user).deliver_later
          
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
      
      # POST /api/v1/user/reset-password
      def reset_password
        user = User.find_by(reset_password_token: params[:token])
        
        if user && user.reset_password_token_valid?
          if user.reset_password(params[:password], params[:password_confirmation])
            render json: { 
              status: 'success',
              message: 'Password has been reset successfully.'
            }, status: :ok
          else
            render json: { 
              status: 'error',
              message: user.errors.full_messages.join(', ')
            }, status: :unprocessable_entity
          end
        else
          render json: { 
            status: 'error',
            message: 'Invalid or expired reset token.'
          }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:name, :email, :phone, :password)
      end
    end
  end
end