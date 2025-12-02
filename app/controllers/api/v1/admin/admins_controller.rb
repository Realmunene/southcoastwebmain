# app/controllers/api/v1/admin/admins_controller.rb
class Api::V1::Admin::AdminsController < ApplicationController
  before_action :authorize_admin
  before_action :authorize_super_admin, only: [:create, :update, :destroy]

  # ✅ List all admins (excluding super_admin)
  def index
    admins = Admin.where(role: 1) # 1 = admin
    render json: admins, status: :ok
  end

  # ✅ Create a new admin (super_admin only)
  def create
    # Prevent creation of another super admin
    if params[:admin][:role].to_s == "0" || params[:admin][:role].to_s.downcase == "super_admin"
      return render json: { error: "You cannot create another super_admin." }, status: :forbidden
    end

    # ✅ Build new admin and force correct role before validation
    admin = Admin.new(admin_params)
    admin.role = 1 # force role to 'admin' before validation runs

    if admin.save
      render json: { message: "Admin created successfully.", admin: admin }, status: :created
    else
      render json: { errors: admin.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # ✅ Update an existing admin (super_admin only)
  def update
    admin = Admin.find_by(id: params[:id])
    return render json: { error: "Admin not found." }, status: :not_found unless admin

    # Prevent updating the super_admin
    if admin.super_admin?
      return render json: { error: "Super Admin cannot be modified." }, status: :forbidden
    end

    # Prevent role manipulation
    if params[:admin]&.key?(:role)
      return render json: { error: "Role updates are not allowed." }, status: :forbidden
    end

    if admin.update(admin_params)
      render json: { message: "Admin updated successfully.", admin: admin }, status: :ok
    else
      render json: { errors: admin.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # ✅ Delete an admin (cannot delete super_admin)
  def destroy
    admin = Admin.find_by(id: params[:id])
    return render json: { error: "Admin not found." }, status: :not_found unless admin

    if admin.super_admin?
      return render json: { error: "Cannot delete super admin." }, status: :unprocessable_entity
    end

    if admin.destroy
      render json: { message: "Admin deleted successfully." }, status: :ok
    else
      render json: { errors: admin.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def admin_params
    # Include :role only to avoid warning, but it's ignored since we override it
    params.require(:admin).permit(:name, :email, :password, :password_confirmation, :role)
  end

  def authorize_admin
    return if current_admin
    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def authorize_super_admin
    return if current_admin&.super_admin?
    render json: { error: "Forbidden - Super Admin access required" }, status: :forbidden
  end
end
