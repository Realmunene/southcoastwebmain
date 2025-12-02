class AddPaymentStatusToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :payment_status, :string
  end
end
