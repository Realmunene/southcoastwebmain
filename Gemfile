source "https://rubygems.org"

ruby "3.4.7"

# --- Core Rails ---
gem "rails", "~> 8.0.3"
gem 'fiddle'

# --- Database & Server ---
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"

# --- Email / Mailers ---
gem "resend"
gem "mail", "~> 2.9.0"
gem "actionmailer", "~> 8.0.3"

# --- Authentication & Utilities ---
gem "bcrypt", "~> 3.1.7"
gem "jwt"
gem "countries"

# --- Middleware & Performance ---
gem "rack-cors", require: "rack/cors"
gem "bootsnap", require: false
gem "thruster", require: false
gem 'redis', '~> 4.0'
gem 'prawn'
gem 'kaminari'
# --- Deployment ---
gem "kamal", require: false

# --- Platform helpers ---
gem "tzinfo-data", platforms: %i[windows jruby]

# --- Environment Variables ---
gem "dotenv-rails", "~> 3.2"

# --- Production-only gems ---
group :production do
  gem "solid_cache"
end

# --- Development-only gems ---
group :development do
  gem "debug", "~> 1.9"
end

# --- Development & Test shared tools ---
group :development, :test do
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
end
