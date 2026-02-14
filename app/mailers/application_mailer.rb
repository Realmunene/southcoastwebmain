# app/mailers/application_mailer.rb
class ApplicationMailer < ActionMailer::Base
  default from: 'no-reply@no-reply.southcoastoutdoors.cloud'
  layout 'mailer'

  private

  def admin_emails
    # Query Admin model for admin and super admin emails
emails = Admin.admin.or(Admin.super_admin).pluck(:email)  
    # Fallback email if no admins are found
    emails.present? ? emails : ["southcoastoutdoors25@gmail.com"]
  end
  
  # Optional: If you need to get primary admin separately
  def primary_admin_email
    # Assuming super_admin is higher than admin
    admin = Admin.where(role: 'super_admin').first || Admin.where(role: 'admin').first
    admin&.email || "southcoastoutdoors25@gmail.com"
  end
end
