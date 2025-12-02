# app/controllers/api/v1/admin/profiles_controller.rb
module Api
  module V1
    module Admin
      class ProfilesController < ApplicationController
        before_action :authorize_admin

        def show
          render json: current_admin, status: :ok
        end

        private

        def authorize_admin
          # Ensure admin is logged in
          unless current_admin
            render json: { error: "Unauthorized" }, status: :unauthorized
          end
        end

        def current_admin
          # Assuming you’re using JWT-based admin auth
          @current_admin ||= Admin.find_by(id: session[:admin_id])
        end
      end
    end
  end
end
