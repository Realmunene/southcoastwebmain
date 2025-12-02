# app/controllers/api/v1/admin/contact_messages_controller.rb
module Api
  module V1
    module Admin
      class ContactMessagesController < BaseController
        before_action :set_contact_message, only: [:show, :mark_as_read, :destroy]
        before_action :authorize_super_admin!, only: [:destroy]

        # GET /api/v1/admin/contact_messages
        def index
          messages = ::ContactMessage.order(created_at: :desc)
          render json: { contact_messages: messages }, status: :ok
        end

        # PATCH /api/v1/admin/contact_messages/:id/mark_as_read
        def mark_as_read
          if @contact_message.update(status: "read")
            render json: { message: "Message marked as read", contact_message: @contact_message }, status: :ok
          else
            render json: { error: @contact_message.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/admin/contact_messages/:id
        def destroy
          @contact_message.destroy
          render json: { message: "Message deleted successfully" }, status: :ok
        end

        private

        def set_contact_message
          @contact_message = ::ContactMessage.find_by(id: params[:id])
          return render(json: { error: "Message not found" }, status: :not_found) unless @contact_message
        end

        # Only allow super admins to delete messages
        def authorize_super_admin!
          unless current_admin&.role.to_s == "0" # assuming 0 = super_admin
            render json: { error: "Forbidden: Only Super Admin can perform this action" }, status: :forbidden
          end
        end
      end
    end
  end
end
