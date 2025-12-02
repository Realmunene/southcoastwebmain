# db/migrate/YYYYMMDDHHMMSS_add_adults_and_children_to_bookings.rb
class AddAdultsAndChildrenToBookings < ActiveRecord::Migration[7.0]
  def change
    add_column :bookings, :adults, :integer, default: 1, null: false
    add_column :bookings, :children, :integer, default: 0, null: false
  end
end