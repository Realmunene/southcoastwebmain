module Api
  module V1
    class ContactMessagesController < ApplicationController
      def create
        @contact_message = ContactMessage.new(contact_message_params)

        if @contact_message.save
          render json: { message: "Message sent successfully" }, status: :created
        else
          render json: { errors: @contact_message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def contact_message_params
        params.require(:contact_message).permit(:email, :message)
      end
    end
  end
end
