class AddPaymentAmountToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :payment_amount, :decimal, precision: 10, scale: 2
  end
end
