module Api
  module V1
    class SupportMessagesController < ApplicationController
      # Allow requests from frontend (CORS)
    #   skip_before_action :verify_authenticity_token

      def create
        message = SupportMessage.new(support_message_params)
        if message.save
          render json: { message: "Support message sent successfully" }, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def support_message_params
        params.require(:support_message).permit(:email, :message)
      end
    end
  end
end
