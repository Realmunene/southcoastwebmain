class AddPasswordResetIndexes < ActiveRecord::Migration[8.0]
  def change
    add_index :admins, :reset_password_token, unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :partners, :reset_password_token, unique: true
  end
end
