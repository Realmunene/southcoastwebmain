class AddPasswordResetToAdmins < ActiveRecord::Migration[8.0]
  def change
    add_column :admins, :reset_password_token, :string
    add_column :admins, :reset_password_sent_at, :datetime
  end
end
