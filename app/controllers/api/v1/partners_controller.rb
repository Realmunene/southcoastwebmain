# app/controllers/api/v1/partners_controller.rb
module Api
  module V1
    class PartnersController < ApplicationController
      # Remove these lines - they're causing errors
      # skip_before_action :authorize_request, only: [:register, :login, :forgot_password, :reset_password]
      # skip_before_action :authorize_partner!, only: [:register, :login, :forgot_password, :reset_password]

      # POST /api/v1/partners/register
      def register
        partner = Partner.new(partner_params)
        if partner.save
          token = encode_token({ partner_id: partner.id, role: 'partner', type: 'partner' })
          render json: { message: 'Partner registered successfully', token: token, partner: partner }, status: :created
        else
          render json: { errors: partner.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/partners/login
      def login
        partner = Partner.find_by(email: params[:email])
        
        if partner && partner.authenticate(params[:password])
          token = encode_token({ partner_id: partner.id, role: 'partner', type: 'partner' })
          render json: { 
            status: 'success', 
            message: 'Login successful',
            token: token, 
            partner: {
              id: partner.id,
              supplier_name: partner.supplier_name,
              email: partner.email,
              contact_person: partner.contact_person,
              supplier_type: partner.supplier_type
            }
          }, status: :ok
        else
          render json: { 
            status: 'error',
            message: 'Invalid email or password'
          }, status: :unauthorized
        end
      end

      # POST /api/v1/partners/forgot-password
      def forgot_password
        partner = Partner.find_by(email: params[:email])
        
        if partner
          # Generate password reset token
          partner.generate_password_reset_token!
          
          # Send password reset email
          PartnerMailer.password_reset(partner).deliver_later
          
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
      
      # POST /api/v1/partners/reset-password
      def reset_password
        partner = Partner.find_by(reset_password_token: params[:token])
        
        if partner && partner.reset_password_token_valid?
          if partner.reset_password(params[:password], params[:password_confirmation])
            render json: { 
              status: 'success',
              message: 'Password has been reset successfully.'
            }, status: :ok
          else
            render json: { 
              status: 'error',
              message: partner.errors.full_messages.join(', ')
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