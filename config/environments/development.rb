# config/environments/development.rb
require "active_support/core_ext/integer/time"

Rails.application.configure do
  # -----------------------------------------------
  # ✅ Core Rails Development Configuration
  # -----------------------------------------------
  config.cache_classes = false
  config.eager_load = false
  config.consider_all_requests_local = true

  config.server_timing = true

  config.cache_store = :memory_store
  config.public_file_server.enabled = true
  config.action_mailer.default_options = {
    from: 'Acme <onboarding@resend.dev>'
  }
  # -----------------------------------------------
  # ✅ Mailer Configuration (Resend)
  # -----------------------------------------------
  config.action_mailer.default_url_options = { host: "localhost", port: 3000 }
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: "smtp.resend.com",
    port: 587,
    user_name: "resend", 
    password: ENV.fetch("RESEND_API_KEY", nil),
    authentication: :plain,
    enable_starttls_auto: true,
    open_timeout: 5,
    read_timeout: 5
  }

  # Log deprecation notices to the Rails logger.
  config.active_support.deprecation = :log
  config.active_support.disallowed_deprecation = :raise

  # Raises error for missing translations
  # config.i18n.raise_on_missing_translations = true

  config.active_record.verbose_query_logs = true
end
