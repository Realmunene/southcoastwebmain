# config/routes.rb

Rails.application.routes.draw do
  # ===========================
  # API routes (version 1)
  # ===========================
  namespace :api do
    namespace :v1 do
      # ===========================
      # Authentication
      # ===========================
      post '/admin/login', to: 'sessions#login_admin'
      post '/user/login', to: 'sessions#login_user'
      delete '/logout', to: 'sessions#destroy'
      get '/admin/profile', to: 'sessions#admin_profile'
      get '/user/profile', to: 'sessions#user_profile'

      # ===========================
      # Password Recovery
      # ===========================
      # Admin password recovery
      post 'admin/forgot-password', to: 'admins#forgot_password'
      post 'admin/reset-password', to: 'admins#reset_password'
      
      # User password recovery
      post 'user/forgot-password', to: 'users#forgot_password'
      post 'user/reset-password', to: 'users#reset_password'
      
      # Partner password recovery
      post 'partners/forgot-password', to: 'partners#forgot_password'
      post 'partners/reset-password', to: 'partners#reset_password'

      # ===========================
      # Partners — Self Service
      # ===========================
      post 'partners/register', to: 'partners#register'
      post 'partners/login', to: 'partners#login'

      # ===========================
      # Users
      # ===========================
      resources :users, only: [:create]

      # ===========================
      # Room Types
      # ===========================
      resources :room_types, only: [:index]

      # ===========================
      # Nationalities
      # ===========================
      resources :nationalities, only: [:index]

      # ===========================
      # Bookings (User)
      # ===========================
      resources :bookings, only: [:create, :index, :show, :update, :destroy] do
        member do
          post 'payments', to: 'payments#create'
          patch 'payments/status', to: 'payments#update_payment_status'
        end
      end

      # ===========================
      # Admin Namespace
      # ===========================
      namespace :admin do
        # Dashboard & Stats
        get 'dashboard', to: 'dashboard#index'
        get 'stats', to: 'dashboard#stats'

        # Admin profile endpoint
        get 'profile', to: 'profiles#show'

        # Payment management
        patch 'bookings/:booking_id/payment_status', to: 'payments#update_payment_status'
        resources :payments, only: [:index, :show, :destroy] do
          collection do
            get :export
          end
        end

        # Core admin management
        resources :bookings, only: [:index, :create, :update, :destroy]
        resources :users, only: [:index, :destroy]
        resources :admins, only: [:index, :create, :update, :destroy]

        # Contact messages
        resources :contact_messages, only: [:index, :show, :destroy] do
          patch :mark_as_read, on: :member
        end

        # Partners management
        resources :partners, only: [:index, :show, :create, :destroy]
      end

      # ===========================
      # Support Messages
      # ===========================
      resources :support_messages, only: [:create, :index]

      # ===========================
      # Contact Messages
      # ===========================
      resources :contact_messages, only: [:create, :index]

      # ===========================
      # Health Check
      # ===========================
      get 'up' => 'rails/health#show', as: :rails_health_check
    end
  end

  # ===========================
  # React Frontend Routing
  # ===========================

  # Serve the React index.html at root
  root "static#index"

  # Prevent Rails from swallowing CRA build assets
  # get "/static/*path", to: proc { [404, {}, ["Not Found"]] }

  # React Router fallback (MUST be last)
  get "*path", to: "static#index", constraints: ->(req) do
    !req.xhr? && req.format.html?
  end
end