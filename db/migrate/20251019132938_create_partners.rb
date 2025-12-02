class CreatePartners < ActiveRecord::Migration[8.0]
  def change
    create_table :partners do |t|
      t.string :supplier_type
      t.string :supplier_name
      t.string :mobile
      t.string :email
      t.string :contact_person
      t.string :password_digest
      t.text :description
      t.string :city
      t.string :address

      t.timestamps
    end
  end
end
