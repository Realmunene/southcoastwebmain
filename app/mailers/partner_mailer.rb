class PartnerMailer < ApplicationMailer
  default from: 'partners@southcoastoutdoors.cloud'
  
  def password_reset(partner)
    @partner = partner
    @reset_url = "#{ENV['FRONTEND_URL']}/partner/reset-password?token=#{partner.reset_password_token}"
    
    mail(
      to: @partner.email,
      subject: 'Reset Your SouthCoast Partner Portal Password'
    )
  end
end