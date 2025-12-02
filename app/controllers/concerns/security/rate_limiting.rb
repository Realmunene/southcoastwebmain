# app/controllers/concerns/security/rate_limiting.rb
module Security::RateLimiting
  extend ActiveSupport::Concern

  def rate_limited?(key:, limit:, period:)
    current_count = Redis.current.get(key).to_i
    
    if current_count >= limit
      true
    else
      Redis.current.multi do
        Redis.current.incr(key)
        Redis.current.expire(key, period.to_i) if current_count == 0
      end
      false
    end
  end

  def get_rate_limit_info(key)
    current_count = Redis.current.get(key).to_i
    ttl = Redis.current.ttl(key)
    
    {
      current: current_count,
      remaining: [RATE_LIMIT - current_count, 0].max,
      reset_time: Time.now + ttl
    }
  end
end