# config/initializers/rack_attack.rb
# Protect your API from abusive requests

if defined?(Rack::Attack)
  class Rack::Attack
    # ✅ Allow localhost and internal requests
    safelist_ip("127.0.0.1")
    safelist_ip("::1")

    # ✅ Example throttle: limit IPs to 60 requests per minute
    throttle("req/ip", limit: 60, period: 1.minute) do |req|
      req.ip unless req.path.start_with?("/assets")
    end

    # ✅ Optionally block known bad actors
    blocklist("block bad bots") do |req|
      req.user_agent =~ /BadBot/i
    end
  end

  Rails.application.config.middleware.use Rack::Attack
else
  Rails.logger.warn "⚠️ Rack::Attack not loaded — skipping rate limiting."
end
