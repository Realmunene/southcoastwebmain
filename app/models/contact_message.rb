require 'resolv'

class ContactMessage < ApplicationRecord
  validates :email, presence: true
  validate :email_format_and_domain

  validates :message, presence: true

  private

  # ✅ Combined email format + DNS check (with caching + logging)
  def email_format_and_domain
    if email.blank?
      log_invalid_email("blank email")
      return errors.add(:email, "Enter a valid email address")
    end

    # Step 1: format validation
    unless /\A[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\z/.match?(email)
      log_invalid_email("invalid format")
      return errors.add(:email, "Enter a valid email address")
    end

    # Step 2: domain validation (cached)
    domain = email.split('@').last
    unless domain_valid?(domain)
      log_invalid_email("invalid domain: #{domain}")
      return errors.add(:email, "Enter a valid email address")
    end
  end

  # ✅ Cached DNS lookup for domain validation
  def domain_valid?(domain)
    cache_key = "dns_check:#{domain}"

    Rails.cache.fetch(cache_key, expires_in: 12.hours) do
      begin
        mx_records = Resolv::DNS.open { |dns| dns.getresources(domain, Resolv::DNS::Resource::IN::MX) }
        a_records  = Resolv::DNS.open { |dns| dns.getresources(domain, Resolv::DNS::Resource::IN::A) }

        !(mx_records.empty? && a_records.empty?)
      rescue Resolv::ResolvError, SocketError
        false
      end
    end
  end

  # ✅ Log invalid or suspicious emails
  def log_invalid_email(reason)
    log_path = Rails.root.join("log", "invalid_emails.log")
    File.open(log_path, "a") do |file|
      file.puts "[#{Time.current}] Invalid email: \"#{email}\" | Reason: #{reason}"
    end
  rescue => e
    Rails.logger.error "Failed to log invalid email: #{e.message}"
  end
end
