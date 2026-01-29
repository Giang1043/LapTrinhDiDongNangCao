/**
 * Rate Limiting - Giới hạn tần suất truy cập
 * Bảo vệ API khỏi brute-force, DDoS
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitConfig {
  windowMs: number; // Khoảng thời gian tính bằng milliseconds
  maxRequests: number; // Số request tối đa trong khoảng thời gian
  message?: string;
  statusCode?: number;
}

/**
 * Rate Limiter cho client-side
 * Lưu trữ trong bộ nhớ (không dùng cho production, dùng Redis trong thực tế)
 */
class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      statusCode: 429,
      ...config,
    };

    // Dọn dẹp store cũ hàng giờ
    this.cleanupInterval();
  }

  /**
   * Kiểm tra xem request có vượt giới hạn không
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[key].resetTime,
      };
    }

    const record = this.store[key];

    // Nếu đã quá thời gian reset, tạo mới record
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.config.windowMs;
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: record.resetTime,
      };
    }

    // Tăng count
    record.count++;

    const allowed = record.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - record.count);

    return {
      allowed,
      remaining,
      resetTime: record.resetTime,
    };
  }

  /**
   * Reset rate limit cho một identifier
   */
  reset(identifier: string): void {
    const key = `rate_limit:${identifier}`;
    delete this.store[key];
  }

  /**
   * Lấy thông tin rate limit hiện tại
   */
  getStatus(identifier: string) {
    const key = `rate_limit:${identifier}`;
    const record = this.store[key];

    if (!record) {
      return null;
    }

    const now = Date.now();
    const timeRemaining = Math.max(0, record.resetTime - now);

    return {
      count: record.count,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetTime: record.resetTime,
      timeRemaining,
    };
  }

  /**
   * Dọn dẹp các record cũ
   */
  private cleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      for (const key in this.store) {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      }
    }, 60 * 60 * 1000); // Mỗi giờ
  }
}

/**
 * Tạo rate limiter cho login (5 lần/15 phút)
 */
export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  maxRequests: 5,
  message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút',
  statusCode: 429,
});

/**
 * Tạo rate limiter cho register (3 lần/1 giờ)
 */
export const registerRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 giờ
  maxRequests: 3,
  message: 'Quá nhiều yêu cầu đăng ký, vui lòng thử lại sau',
  statusCode: 429,
});

/**
 * Tạo rate limiter cho forgot password (3 lần/1 giờ)
 */
export const forgotPasswordRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 giờ
  maxRequests: 3,
  message: 'Quá nhiều yêu cầu đặt lại mật khẩu, vui lòng thử lại sau',
  statusCode: 429,
});

/**
 * Tạo rate limiter cho API chung (100 lần/15 phút)
 */
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  maxRequests: 100,
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
  statusCode: 429,
});

/**
 * Hook để kiểm tra rate limit trong React
 */
export const useRateLimit = (limiter: RateLimiter, identifier: string) => {
  const checkLimit = (): { allowed: boolean; message?: string; remaining: number } => {
    const result = limiter.check(identifier);

    if (!result.allowed) {
      const status = limiter.getStatus(identifier);
      const minutes = Math.ceil((status?.timeRemaining || 0) / 1000 / 60);
      
      return {
        allowed: false,
        message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${minutes} phút.`,
        remaining: result.remaining,
      };
    }

    return {
      allowed: true,
      remaining: result.remaining,
    };
  };

  const reset = () => limiter.reset(identifier);

  const getStatus = () => limiter.getStatus(identifier);

  return {
    checkLimit,
    reset,
    getStatus,
  };
};

export default RateLimiter;
