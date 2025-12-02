# app/controllers/api/v1/admin/partners_controller.rb
module Api
  module V1
    module Admin
      class PartnersController < BaseController
        before_action :authenticate_admin!

        # GET /api/v1/admin/partners
        def index
          partners = Partner.order(created_at: :desc)
          render json: partners.as_json(
            only: [:id, :supplier_name, :supplier_type, :email, :mobile, :city, :contact_person, :created_at]
          ), status: :ok
        end

        # GET /api/v1/admin/partners/:id
        def show
          partner = Partner.find(params[:id])
          render json: partner.as_json(except: [:password_digest]), status: :ok
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'Partner not found' }, status: :not_found
        end

        # ✅ POST /api/v1/admin/partners
        def create
          partner = Partner.new(partner_params)
          if partner.save
            render json: { message: 'Partner created successfully', partner: partner }, status: :created
          else
            render json: { errors: partner.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/admin/partners/:id
        def destroy
          partner = Partner.find(params[:id])
          partner.destroy
          render json: { message: 'Partner deleted successfully' }, status: :ok
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'Partner not found' }, status: :not_found
        end

        private

        def partner_params
          params.require(:partner).permit(
            :supplier_type,
            :supplier_name,
            :mobile,
            :email,
            :contact_person,
            :password,
            :description,
            :city,
            :address
          )
        end
      end
    end
  end
end
