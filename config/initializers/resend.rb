# config/initializers/resend.rb
require "resend"

Resend.api_key = ENV.fetch("RESEND_API_KEY", nil)

class ResendDeliveryMethod
  def initialize(_settings = {}); end

  def deliver!(mail)
    return unless Resend.api_key

    Resend::Emails.send(
      from: mail.from.first,
      to: mail.to,
      subject: mail.subject,
      html: mail.html_part ? mail.html_part.body.decoded : mail.body.decoded
    )
  rescue => e
    Rails.logger.error "❌ Resend delivery failed: #{e.message}"
  end
end

# Register the delivery method so ActionMailer recognizes :resend
ActionMailer::Base.add_delivery_method :resend, ResendDeliveryMethod
Rails.logger.info "✅ ResendDeliveryMethod registered successfully."
