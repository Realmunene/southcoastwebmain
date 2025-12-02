class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.string :nationality
      t.string :room_type
      t.date :check_in
      t.date :check_out
      t.string :guests

      t.timestamps
    end
  end
end
