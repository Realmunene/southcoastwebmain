class AddPriceToRoomTypes < ActiveRecord::Migration[8.0]
  def change
    add_column :room_types, :price, :decimal
  end
end
