class CreateNationalities < ActiveRecord::Migration[8.0]
  def change
    create_table :nationalities do |t|
      t.string :Name

      t.timestamps
    end
  end
end
