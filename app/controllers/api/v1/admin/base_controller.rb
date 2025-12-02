# app/controllers/api/v1/admin/base_controller.rb
module Api
  module V1
    module Admin
      class BaseController < ApplicationController
        before_action :authenticate_admin!

        private

        def authenticate_admin!
          header = request.headers['Authorization']
          token = header.split(' ').last if header

          if token
            begin
              decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
              admin_id = decoded[0]['admin_id']
              @current_admin = ::Admin.find_by(id: admin_id)

              unless @current_admin
                render json: { error: 'Admin not found' }, status: :unauthorized
              end
            rescue JWT::ExpiredSignature
              render json: { error: 'Token has expired' }, status: :unauthorized
            rescue JWT::DecodeError => e
              render json: { error: "Invalid token: #{e.message}" }, status: :unauthorized
            end
          else
            render json: { error: 'Authorization header missing' }, status: :unauthorized
          end
        end

        def current_admin
          @current_admin
        end
      end
    end
  end
end
