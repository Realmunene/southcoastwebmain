# config/puma.rb
# ------------------------------
# Puma configuration for Render / Production

# Ensure logs flush immediately (no buffering)
$stdout.sync = true
$stderr.sync = true

# Thread settings
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

# Port Render provides
port ENV.fetch("PORT") { 3000 }

# Environment
environment ENV.fetch("RAILS_ENV") { "development" }

# PID file
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Use multiple workers in production (Render auto-scales this)
if ENV["RAILS_ENV"] == "production"
  workers ENV.fetch("WEB_CONCURRENCY") { 2 } # 2 workers is ideal for Render Starter
  preload_app!  # Preload app before forking
end

# Allow restart from `rails restart`
plugin :tmp_restart

# Optional: helpful startup log
on_worker_boot do
  puts "🚀 Puma worker booted! (PID: #{Process.pid})"
end

on_worker_shutdown do
  puts "🛑 Puma worker shutting down... (PID: #{Process.pid})"
end
