class NationalitiesRenamed < ActiveRecord::Migration[8.0]
  def change
    rename_column :nationalities, :Name, :name
  end
end
