# app/controllers/api/v1/admin_dashboard_controller.rb
module Api
  module V1
    class AdminDashboardController < ApplicationController
      before_action :authorize_request
      before_action :authorize_super_admin, only: [:create_admin, :delete_admin]

      def index
        render json: {
          message: "Welcome to the Admin Dashboard!",
          email: @current_super_admin.email,
          role: @current_super_admin.role
        }
      end

      # ✅ Only real super_admins can create admins
      def create_admin
        admin = Admin.new(admin_params.merge(role: "admin"))
        if admin.save
          render json: { message: "Admin created successfully.", admin: admin }, status: :created
        else
          render json: { errors: admin.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # ✅ Only real super_admins can delete admins
      def delete_admin
        admin = Admin.find_by(id: params[:id], role: "admin")
        if admin
          admin.destroy
          render json: { message: "Admin deleted successfully." }
        else
          render json: { error: "Admin not found." }, status: :not_found
        end
      end

      private

      def authorize_request
        header = request.headers["Authorization"]
        token = header.split(" ").last if header

        begin
          decoded = JWT.decode(token, Rails.application.secrets.secret_key_base)[0]
          @current_super_admin = Admin.find(decoded["admin_id"])
        rescue JWT::DecodeError, ActiveRecord::RecordNotFound
          render json: { error: "Unauthorized" }, status: :unauthorized
        end
      end

      def authorize_super_admin
        unless @current_super_admin.super_admin?
          render json: { error: "Forbidden: Only super_admins can perform this action." }, status: :forbidden
        end
      end

      def admin_params
        params.require(:admin).permit(:email, :password, :password_confirmation)
      end
    end
  end
end
