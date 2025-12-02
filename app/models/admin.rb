class Admin < ApplicationRecord
  has_secure_password

  # ✅ Validations
  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || password.present? }
  validate :strong_password
  validate :single_super_admin, if: -> { role.present? && role.to_i == 0 }

  # ✅ Automatically set default role to 'admin' (1)
  after_initialize :set_default_role, if: :new_record?

  def set_default_role
    self.role ||= 1
  end

  # ✅ Ensure only one super_admin exists
  def single_super_admin
    return unless column_names.include?("role")
    if Admin.where(role: 0).where.not(id: id).exists?
      errors.add(:role, "There can only be one Super Admin in the system.")
    end
  end

  # ✅ Password Reset Methods
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

    # Check strong password requirements
    unless new_password.match?(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).+$/)
      errors.add(:password, "must include upper, lower, digit, and special character")
      return false
    end

    self.password = new_password
    self.password_confirmation = confirmation
    self.reset_password_token = nil
    self.reset_password_sent_at = nil
    
    if save
      true
    else
      errors.add(:base, "Failed to save password")
      false
    end
  end

  # ✅ Helper methods
  def super_admin?
    role.to_i == 0 rescue false
  end

  def active?
    true # temporary - update with your actual logic
  end

  private

  # ✅ Strong password policy
  def strong_password
    return if password.blank?

    unless password.match?(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).+$/)
      errors.add(:password, "must include upper, lower, digit, and special character")
    end
  end

  def generate_token
    SecureRandom.urlsafe_base64
  end
end