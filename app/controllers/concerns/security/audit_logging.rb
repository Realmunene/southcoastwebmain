# app/controllers/concerns/security/audit_logging.rb
module Security::AuditLogging
  def log_successful_login(user_id, user_type, request)
    AuditLog.create!(
      user_id: user_id,
      user_type: user_type,
      action: 'LOGIN_SUCCESS',
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      timestamp: Time.current
    )
  end

  def log_failed_login_attempt(identifier, user_type, reason)
    AuditLog.create!(
      user_identifier: identifier,
      user_type: user_type,
      action: 'LOGIN_FAILED',
      reason: reason,
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      timestamp: Time.current
    )
  end

  def log_logout(decoded_token)
    AuditLog.create!(
      user_id: decoded_token['admin_id'] || decoded_token['user_id'],
      user_type: decoded_token['type'],
      action: 'LOGOUT',
      ip_address: request.remote_ip,
      timestamp: Time.current
    )
  end
end