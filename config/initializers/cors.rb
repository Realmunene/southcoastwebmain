# config/initializers/cors.rb
<<<<<<< HEAD

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://southcoastoutdoors.cloud', 'https://realmunene.github.io', 'http://localhost:3001'
=======
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://southcoastoutdoors.cloud', 'https://realmunene.github.io'
>>>>>>> 2364cf9 (fixture)

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end
