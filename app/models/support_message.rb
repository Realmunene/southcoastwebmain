class SupportMessage < ApplicationRecord
    validates :email, presence: true
    validates :message, presence: true
end
