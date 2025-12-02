class User < ApplicationRecord
  has_secure_password

  # 👇 Association
  has_many :bookings, dependent: :destroy

  # 👇 Validations - FIX: Add condition to password validation
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :phone, presence: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || password.present? }

  # 👇 Password reset attributes
  attr_accessor :reset_password_token, :reset_password_sent_at

  # 👇 Password Reset Methods
  def generate_password_reset_token!
    self.reset_password_token = generate_token
    self.reset_password_sent_at = Time.current
    save(validate: false) # Skip validations for password reset
  end

  def reset_password_token_valid?
    reset_password_sent_at && reset_password_sent_at > 1.hour.ago
  end

  def reset_password(new_password, confirmation)
    if new_password != confirmation
      errors.add(:password_confirmation, "doesn't match Password")
      return false
    end

    if new_password.length < 6
      errors.add(:password, "must be at least 6 characters")
      return false
    end

    self.password = new_password
    self.reset_password_token = nil
    self.reset_password_sent_at = nil
    
    if save
      true
    else
      errors.add(:base, "Failed to save password")
      false
    end
  end

  # 👇 Add these methods for session controller
  def active?
    true # temporary - update with your actual logic
  end

  private

  def generate_token
    SecureRandom.urlsafe_base64
  end

  # Remove update_last_login! method since we're using update_columns directly
end