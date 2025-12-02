class AddUserIdToBookings < ActiveRecord::Migration[8.0]
  def change
    add_reference :bookings, :user, null: true, foreign_key: true
  end
end
