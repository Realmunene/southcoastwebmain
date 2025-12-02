class RoomTypesRenamed < ActiveRecord::Migration[8.0]
  def change
    rename_column :room_types, :Name, :name
  end
end
