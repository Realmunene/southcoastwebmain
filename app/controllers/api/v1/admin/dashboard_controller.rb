module Api
  module V1
    module Admin
      class DashboardController < ApplicationController
        def stats
          total_bookings = Booking.count
          total_users = User.count
          total_partners = Partner.count
          total_messages = ContactMessage.count

          # 🆕 Get count of the most recent 5 bookings
          recent_bookings_count = Booking.order(created_at: :desc).limit(5).count

          render json: {
            bookings: total_bookings,
            users: total_users,
            partners: total_partners,
            messages: total_messages,
            active_bookings: recent_bookings_count
          }
        end
      end
    end
  end
end
