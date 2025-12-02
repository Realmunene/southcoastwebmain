require 'net/http'
require 'uri'
require 'json'

class ResendMailer
  def self.deliver!(mail)
    uri = URI.parse("https://api.resend.dev/emails")
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{ENV['RESEND_API_KEY']}"
    request["Content-Type"] = "application/json"

    request.body = {
      from: mail.from.first,
      to: mail.to,
      subject: mail.subject,
      html: mail.body.raw_source
    }.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true, read_timeout: 10) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise "Resend API Email Failed: #{response.code} #{response.body}"
    end
  end
end

# Register custom delivery method
ActionMailer::Base.add_delivery_method :resend, ResendMailer
