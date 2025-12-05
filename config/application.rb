require_relative "boot"
require "rails/all"
require 'dotenv/load' if Rails.env.development?

Bundler.require(*Rails.groups)

# Optional: Resend mailer
begin
  require "resend"
  require "action_mailer"

  unless ActionMailer::Base.delivery_methods.key?(:resend)
    ActionMailer::Base.add_delivery_method(:resend, Mail::SMTP)
  end
rescue LoadError => e
  warn "⚠️ Resend not fully initialized: #{e.message}"
end

module BackendSouthcoastwebmain
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true

    # autoload app/lib
    config.autoload_paths << Rails.root.join("app/mailers/delivery_methods")

    # Cookies + sessions
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore

    # CORS
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'http://localhost:3001'
        resource '*',
                 headers: :any,
                 methods: %i[get post put patch delete options head],
                 expose: ['Authorization'],
                 credentials: false
      end
    end

    # Background jobs
    config.active_job.queue_adapter = :inline

    # Serve static frontend build (React)
    config.public_file_server.enabled = true
    config.public_file_server.index_name = 'index.html'
  end
end
