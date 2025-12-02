class AdminMailer < ApplicationMailer
  default from: 'admin@southcoastoutdoors.cloud'
  
  def password_reset(admin)
    @admin = admin
    @reset_url = "#{ENV['FRONTEND_URL']}/admin/reset-password?token=#{admin.reset_password_token}"
    
    mail(
      to: @admin.email,
      subject: 'Reset Your SouthCoast Admin Password'
    )
  end
end