# config/initializers/rack_attack.rb
# Protect your API from abusive requests

class Rack::Attack
  # Allow localhost
  safelist_ip("127.0.0.1")
  safelist_ip("::1")

  # Throttle all requests by IP (60 req/min)
  throttle("req/ip", limit: 60, period: 1.minute) do |req|
    req.ip unless req.path.start_with?("/assets")
  end

  # Block obvious bad bots
  blocklist("block bad bots") do |req|
    req.user_agent =~ /BadBot/i
  end
end

Rails.application.config.middleware.use Rack::Attack
