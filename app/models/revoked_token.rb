# app/models/revoked_token.rb
class RevokedToken < ApplicationRecord
  validates :jti, presence: true, uniqueness: true
  validates :expires_at, presence: true

  # Automatically delete expired revoked tokens periodically (optional)
  scope :expired, -> { where("expires_at < ?", Time.current) }

  def self.cleanup_expired
    expired.delete_all
  end
end
