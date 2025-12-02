# app/controllers/concerns/security/token_management.rb
module Security::TokenManagement
  extend ActiveSupport::Concern

  def encode_token(payload)
    JWT.encode(payload, Rails.application.credentials.secret_key_base, 'HS256')
  end

  def decoded_token
    return unless auth_header

    token = auth_header.split(' ').last
    begin
      JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' }).first
    rescue JWT::ExpiredSignature
      nil
    rescue JWT::DecodeError
      nil
    end
  end

  def generate_jti
    SecureRandom.uuid
  end

  def revoke_token(decoded_token)
    # Implement token revocation logic (add to blacklist)
    jti = decoded_token['jti']
    expires_at = Time.at(decoded_token['exp'])
    
    Redis.current.setex("blacklisted_token:#{jti}", expires_at - Time.now.to_i, 'revoked')
  end

  def auth_header
    request.headers['Authorization']
  end
end