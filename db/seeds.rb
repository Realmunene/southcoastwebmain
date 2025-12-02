# db/seeds.rb

require 'countries'

# ---- Seed Nationalities (all countries in the world) ----
puts "🌍 Seeding nationalities..."
Nationality.destroy_all

ISO3166::Country.all
  .sort_by { |c| c.translations['en'] || c.name }
  .each do |c|
    country_name = c.translations['en'] || c.name
    Nationality.find_or_create_by!(name: country_name)
  end

puts "✅ Seeded #{Nationality.count} nationalities."

# ---- Seed Room Types (with prices) ----
puts "🏨 Seeding room types..."
room_options = [
  { name: "Executive Room, Ensuite", price: 75 },
  { name: "2-Connected Room, 1 Ensuite", price: 110 },
  { name: "2 Bedroom Apartment - Living + Kitchen + 2 Ensuite", price: 110 },
  { name: "3-BedRoom Apartment-Kitchen, 2 Ensuite", price: 125 },
  { name: "2-Connected Room, I-Ensuite", price: 110 },
  { name: "2-BedRoom Apartment with Kitchen, 1-Ensuite", price: 125 },
  { name: "Larger Apartment with Kitchen, Balcony, Living, 2 Ensuites", price: 140 }
]

RoomType.destroy_all
room_options.uniq { |r| r[:name] }.each do |room|
  RoomType.find_or_create_by!(name: room[:name]) do |rt|
    rt.price = room[:price]
  end
end

puts "✅ Seeded #{RoomType.count} unique room types with prices."

# ---- Seed Admin Accounts ----
puts "👑 Seeding admin users..."

# Define roles as integers
SUPER_ADMIN = 0
ADMIN = 1

# Super admins we want created
super_admins = [
  {
    email: "southcoastoutdoors25@gmail.com",
    name: "Super Admin (Main)"
  }
]

# Loop through and create super admins
super_admins.each do |sa|
  begin
    Admin.find_or_create_by!(email: sa[:email]) do |admin|
      admin.password = "Admin@123"
      admin.password_confirmation = "Admin@123"
      admin.role = SUPER_ADMIN
      admin.name = sa[:name]
    end
    puts "✅ Super Admin active: #{sa[:email]}"
  rescue => e
    puts "⚠️ Issue with creating #{sa[:email]}: #{e.message}"
  end
end

# Create backup admin only if no role=1 admins exist
if Admin.where(role: ADMIN).none?
  begin
    Admin.create!(
      email: "admin@example.com",
      password: "Admin123!",
      password_confirmation: "Admin123!",
      name: "System Administrator",
      role: ADMIN
    )
    puts "✅ Backup Admin user created: admin@example.com"
  rescue => e
    puts "⚠️ Backup admin creation issue: #{e.message}"
  end
else
  puts "ℹ️ Additional admin(s) already exist. No backup admin created."
end

puts "✅ Total Admin Users: #{Admin.count}"
puts "🎉 Seeding complete!"
