class AddRoleAndNameToAdmins < ActiveRecord::Migration[7.0]
  def change
    # ✅ Add role column if it doesn't exist, default to super_admin (0)
    add_column :admins, :role, :integer, default: 0 unless column_exists?(:admins, :role)

    # ✅ Add name column if it doesn't exist
    add_column :admins, :name, :string unless column_exists?(:admins, :name)

    # ✅ Initialize existing records without loading the model (avoids enum error)
    reversible do |dir|
      dir.up do
        execute <<-SQL.squish
          UPDATE admins
          SET role = 0,
              name = SUBSTRING(email, 1, POSITION('@' IN email) - 1)
          WHERE name IS NULL OR role IS NULL;
        SQL
      end
    end
  end
end
