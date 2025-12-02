# app/models/booking.rb
class Booking < ApplicationRecord
  # 👇 Associations
  belongs_to :user

  # 👇 Payment status enum (integer-backed for reliability)
  enum :payment_status, { pending: 0, partial_paid: 1, payment_made: 2 }

  # 👇 Validations
  validates :nationality, :room_type, :check_in, :check_out, :adults, :children, presence: true
  validates :adults, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 20 }
  validates :children, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 20 }
  validate :check_out_after_check_in

  # 👇 Payment validations (optional fields)
  validates :mpesa_phone, format: { with: /\A254[17]\d{8}\z/, message: "must be a valid M-Pesa phone number (2547XXXXXXXX)" }, allow_blank: true
  validates :payment_amount, numericality: { greater_than_or_equal_to: 0 }, allow_blank: true

  # 👇 Default payment status
  after_initialize :set_default_payment_status, if: :new_record?

  private

  def set_default_payment_status
    self.payment_status ||= :pending
  end

  def check_out_after_check_in
    return if check_in.blank? || check_out.blank?
    errors.add(:check_out, "must be after check_in") if check_out < check_in
  end
end
