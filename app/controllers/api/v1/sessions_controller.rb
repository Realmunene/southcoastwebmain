# app/controllers/api/v1/sessions_controller.rb
module Api
  module V1
    class SessionsController < ApplicationController
      # Remove all before_action callbacks for now to avoid errors

      def login_admin
        email = login_params[:email]&.downcase&.strip
        password = login_params[:password]

        unless email.present? && password.present?
          return render json: { error: "Email and password are required" }, status: :unprocessable_entity
        end

        admin = ::Admin.find_by(email: email)
        
        if admin && admin.authenticate(password)
          token = encode_token({
            admin_id: admin.id,
            role: admin.role,
            type: 'admin',
            exp: 24.hours.from_now.to_i
          })

          render json: {
            message: "Admin logged in successfully",
            admin: admin.as_json(except: [:password_digest]),
            token: token
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def login_user
        email = login_params[:email]&.downcase&.strip
        password = login_params[:password]

        unless email.present? && password.present?
          return render json: { error: "Email and password are required" }, status: :unprocessable_entity
        end

        user = User.find_by(email: email)
        
        if user && user.authenticate(password)
          token = encode_token({
            user_id: user.id,
            role: "user",
            type: 'user',
            exp: 24.hours.from_now.to_i
          })

          render json: {
            message: "User logged in successfully",
            user: user.as_json(except: [:password_digest]),
            token: token
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def admin_profile
        if current_admin
          render json: { admin: current_admin.as_json(except: [:password_digest]) }, status: :ok
        else
          render json: { error: "Unauthorized" }, status: :unauthorized
        end
      end

      def user_profile
        if current_user
          render json: { user: current_user.as_json(except: [:password_digest]) }, status: :ok
        else
          render json: { error: "Unauthorized" }, status: :unauthorized
        end
      end

      def destroy
        render json: { message: "Logged out successfully" }, status: :ok
      end

      private

      def login_params
        if params[:session].present?
          params.require(:session).permit(:email, :password)
        else
          params.permit(:email, :password)
        end
      end
    end
  end
end