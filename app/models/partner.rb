class Partner < ApplicationRecord
  has_secure_password  # enables password hashing and authentication

  validates :supplier_type, :supplier_name, :mobile, :email, :contact_person, :city, presence: true
  validates :email, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { password.present? }

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

  private

  def generate_token
    SecureRandom.urlsafe_base64
  end
end