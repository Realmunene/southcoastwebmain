class UserMailer < ApplicationMailer
  default from: 'support@no-reply.southcoastoutdoors.cloud'
  
  def password_reset(user)
    @user = user
    @reset_url = "#{ENV['FRONTEND_URL']}/reset-password?token=#{user.reset_password_token}"
    
    mail(
      to: @user.email,
      subject: 'Reset Your SouthCoast Account Password'
    )
  end
end
