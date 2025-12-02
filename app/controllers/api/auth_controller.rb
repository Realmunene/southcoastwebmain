class Api::AuthController < ApplicationController
  def login
    admin = Admin.find_by(email: params[:email])
    Rails.logger.info "Admin login attempt: #{admin&.email || 'unknown'} from IP #{request.remote_ip}"

    if admin && admin.authenticate(params[:password])
      # ✅ Use the main encode_token from ApplicationController
      token = encode_token({
        admin_id: admin.id,
        role: admin.role || 'admin' # ensure the role is embedded
      })

      cookies.signed[:admin_token] = {
        value: token,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :strict
      }

      render json: { admin: { email: admin.email, role: admin.role }, token: token }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end
end
