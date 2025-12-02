ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
# config/boot.rb
# Load fiddle if available, silence warning if not needed
begin
  require "fiddle"
rescue LoadError
  # ignore, fiddle is part of Ruby stdlib in 3.4
end
