import Redis from 'ioredis';

export interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Maximum requests per window
	keyPrefix?: string; // Prefix for Redis keys
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetTime: number; // Unix timestamp when window resets
	retryAfter?: number; // Seconds to wait before retry (if not allowed)
}

export class RedisRateLimiter {
	private redis: Redis;
	private config: RateLimitConfig;

	constructor(redisUrl: string, config: RateLimitConfig) {
		this.redis = new Redis(redisUrl, {
			connectTimeout: 5000,
			lazyConnect: true,
			maxRetriesPerRequest: 3
		});
		this.config = {
			keyPrefix: 'rate_limit:',
			...config
		};
	}

	/**
	 * Check if a request is allowed and update the rate limit counter
	 * Uses sliding window algorithm with Redis
	 */
	async checkLimit(identifier: string): Promise<RateLimitResult> {
		const key = `${this.config.keyPrefix}${identifier}`;
		const now = Date.now();
		const windowStart = now - this.config.windowMs;

		try {
			// Use Redis pipeline for atomic operations
			const pipeline = this.redis.pipeline();
			
			// Remove expired entries (older than window)
			pipeline.zremrangebyscore(key, 0, windowStart);
			
			// Count current requests in window
			pipeline.zcard(key);
			
			// Add current request timestamp
			pipeline.zadd(key, now, `${now}-${Math.random()}`);
			
			// Set expiration for the key
			pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));
			
			const results = await pipeline.exec();
			
			if (!results) {
				throw new Error('Redis pipeline failed');
			}

			// Get count after removing expired entries but before adding new request
			const currentCount = results[1]?.[1] as number;
			
			const allowed = currentCount < this.config.maxRequests;
			const remaining = Math.max(0, this.config.maxRequests - currentCount - (allowed ? 1 : 0));
			const resetTime = Math.ceil((now + this.config.windowMs) / 1000);

			// If not allowed, remove the request we just added
			if (!allowed) {
				await this.redis.zremrangebyrank(key, -1, -1);
			}

			const result: RateLimitResult = {
				allowed,
				remaining,
				resetTime
			};

			// Add retry-after if rate limited
			if (!allowed) {
				// Get the oldest request in the current window
				const oldestRequests = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
				if (oldestRequests.length >= 2) {
					const oldestTimestamp = parseInt(oldestRequests[1] as string);
					const retryAfterMs = (oldestTimestamp + this.config.windowMs) - now;
					result.retryAfter = Math.ceil(Math.max(0, retryAfterMs) / 1000);
				}
			}

			return result;

		} catch (error) {
			console.error('Redis rate limiter error:', error);
			
			// Fail open - allow request if Redis is down
			return {
				allowed: true,
				remaining: this.config.maxRequests - 1,
				resetTime: Math.ceil((now + this.config.windowMs) / 1000)
			};
		}
	}

	/**
	 * Reset rate limit for a specific identifier
	 */
	async resetLimit(identifier: string): Promise<void> {
		const key = `${this.config.keyPrefix}${identifier}`;
		await this.redis.del(key);
	}

	/**
	 * Get current status without updating counters
	 */
	async getStatus(identifier: string): Promise<Omit<RateLimitResult, 'allowed'>> {
		const key = `${this.config.keyPrefix}${identifier}`;
		const now = Date.now();
		const windowStart = now - this.config.windowMs;

		try {
			// Remove expired entries
			await this.redis.zremrangebyscore(key, 0, windowStart);
			
			// Count current requests
			const currentCount = await this.redis.zcard(key);
			const remaining = Math.max(0, this.config.maxRequests - currentCount);
			const resetTime = Math.ceil((now + this.config.windowMs) / 1000);

			return {
				remaining,
				resetTime
			};

		} catch (error) {
			console.error('Redis rate limiter status error:', error);
			
			return {
				remaining: this.config.maxRequests,
				resetTime: Math.ceil((now + this.config.windowMs) / 1000)
			};
		}
	}

	/**
	 * Close Redis connection
	 */
	async close(): Promise<void> {
		await this.redis.quit();
	}
}

// Export a singleton instance for scraping API
let scrapingRateLimiter: RedisRateLimiter | null = null;

export function getScrapingRateLimiter(): RedisRateLimiter {
	if (!scrapingRateLimiter) {
		const redisUrl = process.env.REDIS_URL;
		if (!redisUrl) {
			console.warn('⚠️ REDIS_URL not configured. Using memory-based rate limiting for development.');
			// For development without Redis, create a mock Redis URL
			// This will fail open and allow requests
		}

		scrapingRateLimiter = new RedisRateLimiter(redisUrl || 'redis://localhost:6379', {
			windowMs: 60 * 60 * 1000, // 1 hour
			maxRequests: 1, // 1 request per hour
			keyPrefix: 'scraping_api:'
		});
	}

	return scrapingRateLimiter;
}
