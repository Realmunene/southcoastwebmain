class AddMpesaPhoneToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :mpesa_phone, :string
  end
end
