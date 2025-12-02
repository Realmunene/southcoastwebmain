class AddLastLoginAtToAdmins < ActiveRecord::Migration[8.0]
  def change
    add_column :admins, :last_login_at, :datetime
  end
end
