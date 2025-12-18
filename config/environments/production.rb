# config/environments/production.rb
require "active_support/core_ext/integer/time"

Rails.application.configure do
  # -----------------------------------------------
  # ✅ Core Rails Production Configuration
  # -----------------------------------------------
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false

  # 🔹 Serve static files from /public even if ENV not set
  config.public_file_server.enabled = true

  config.log_level = :info
  config.log_tags = [:request_id]
  config.active_storage.service = :local
  config.active_record.dump_schema_after_migration = false

  # -----------------------------------------------
  # ✅ Action Mailer Configuration (Resend)
  # -----------------------------------------------
  config.action_mailer.default_url_options = {
    host: "southcoastoutdoors.cloud",
    protocol: "https"
  }

  config.action_mailer.perform_caching = false
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.perform_deliveries = true

  # ✅ Use Resend SMTP
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: "smtp.resend.com",
    port: 587,
    user_name: "resend",
    password: ENV["RESEND_API_KEY"],
    authentication: :login,
    enable_starttls_auto: true
  }

  config.action_mailer.default_options = {
    from: 'South Coast Outdoors <no-reply@southcoastoutdoors.cloud>'
  }

  # ✅ Mailer logging
  mail_logger = ActiveSupport::Logger.new(STDOUT)
  mail_logger.formatter = config.log_formatter
  config.action_mailer.logger = ActiveSupport::TaggedLogging.new(mail_logger)

  # ✅ Verify Resend key on boot
  config.after_initialize do
    if ENV["RESEND_API_KEY"].present?
      Rails.logger.info "✅ Resend mailer configured successfully."
    else
      Rails.logger.warn "⚠️ Missing RESEND_API_KEY — emails will not be sent."
      config.action_mailer.perform_deliveries = false
    end
  end
end
