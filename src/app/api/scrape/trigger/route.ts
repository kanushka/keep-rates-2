import { NextRequest, NextResponse } from 'next/server';
import { getScrapingRateLimiter } from '~/services/rate-limiter/redis-rate-limiter';
import { getScrapingService } from '~/services/scrapers/scraping-service';

/**
 * POST /api/scrape/trigger
 * 
 * Triggers scraping of all bank exchange rates.
 * Rate limited to 1 call per hour.
 * Requires API key authentication.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		// 1. Validate API key
		const apiKey = request.headers.get('x-api-key');
		const expectedApiKey = process.env.SCRAPING_API_KEY;
		
		if (!expectedApiKey) {
			console.error('❌ SCRAPING_API_KEY environment variable not configured');
			return NextResponse.json(
				{ 
					error: 'Server configuration error',
					message: 'Scraping API not properly configured'
				},
				{ status: 500 }
			);
		}

		if (!apiKey || apiKey !== expectedApiKey) {
			console.warn('🔒 Unauthorized scraping API attempt');
			return NextResponse.json(
				{ 
					error: 'Unauthorized',
					message: 'Valid API key required'
				},
				{ status: 401 }
			);
		}

		// 2. Check rate limiting
		const rateLimiter = getScrapingRateLimiter();
		const clientId = 'scraping_trigger'; // Single identifier for all scraping requests
		
		const rateLimit = await rateLimiter.checkLimit(clientId);
		
		if (!rateLimit.allowed) {
			console.warn(`⏰ Rate limit exceeded. Next allowed in ${rateLimit.retryAfter}s`);
			
			const response = NextResponse.json(
				{
					error: 'Rate limit exceeded',
					message: 'Scraping can only be triggered once per hour',
					retryAfter: rateLimit.retryAfter,
					resetTime: rateLimit.resetTime
				},
				{ status: 429 }
			);

			// Add rate limit headers
			response.headers.set('X-RateLimit-Limit', '1');
			response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
			response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
			if (rateLimit.retryAfter) {
				response.headers.set('Retry-After', rateLimit.retryAfter.toString());
			}

			return response;
		}

		// 3. Parse request body for options
		let options: {
			banks?: string[];
			async?: boolean;
		} = {};

		try {
			const body = await request.json();
			options = {
				banks: body.banks, // Optional: specific banks to scrape
				async: body.async !== false // Default to async execution
			};
		} catch {
			// Body parsing failed, use defaults
			options = { async: true };
		}

		console.log(`🚀 Scraping triggered with options:`, options);

		// 4. Execute scraping
		const scrapingService = getScrapingService();

		if (options.async) {
			// Async execution - return immediately and run scraping in background
			// Note: In production, consider using a job queue (Bull, Agenda, etc.)
			setImmediate(async () => {
				try {
					if (options.banks && options.banks.length > 0) {
						// Scrape specific banks
						const results = await Promise.allSettled(
							options.banks.map(bankCode => scrapingService.scrapeBank(bankCode))
						);
						console.log(`🎯 Async scraping completed for banks: ${options.banks.join(', ')}`);
					} else {
						// Scrape all banks
						const result = await scrapingService.scrapeAllBanks();
						console.log(`🎯 Async scraping completed: ${result.successfulBanks}/${result.totalBanks} successful`);
					}
				} catch (error) {
					console.error('💥 Async scraping failed:', error);
				}
			});

			const response = NextResponse.json({
				success: true,
				message: 'Scraping initiated successfully',
				mode: 'async',
				banks: options.banks || 'all',
				timestamp: new Date().toISOString()
			});

			// Add rate limit headers
			response.headers.set('X-RateLimit-Limit', '1');
			response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
			response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

			return response;

		} else {
			// Sync execution - wait for completion (not recommended for production)
			const startTime = Date.now();
			
			let result;
			if (options.banks && options.banks.length > 0) {
				// Scrape specific banks
				const results = await Promise.allSettled(
					options.banks.map(bankCode => scrapingService.scrapeBank(bankCode))
				);
				
				const successfulResults = results
					.filter(r => r.status === 'fulfilled' && r.value.success)
					.map(r => (r as PromiseFulfilledResult<any>).value);

				result = {
					timestamp: new Date(),
					totalBanks: results.length,
					successfulBanks: successfulResults.length,
					failedBanks: results.length - successfulResults.length,
					results: results.map(r => 
						r.status === 'fulfilled' ? r.value : {
							bankCode: 'unknown',
							success: false,
							error: r.reason?.message || 'Unknown error'
						}
					),
					totalDuration: Date.now() - startTime
				};
			} else {
				// Scrape all banks
				result = await scrapingService.scrapeAllBanks();
			}

			const response = NextResponse.json({
				success: true,
				message: 'Scraping completed successfully',
				mode: 'sync',
				result: {
					totalBanks: result.totalBanks,
					successfulBanks: result.successfulBanks,
					failedBanks: result.failedBanks,
					duration: result.totalDuration,
					timestamp: result.timestamp
				}
			});

			// Add rate limit headers
			response.headers.set('X-RateLimit-Limit', '1');
			response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
			response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

			return response;
		}

	} catch (error) {
		console.error('💥 Scraping API error:', error);
		
		return NextResponse.json(
			{
				error: 'Internal server error',
				message: 'Failed to process scraping request',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
}

/**
 * GET /api/scrape/trigger
 * 
 * Returns information about the scraping API and current rate limit status.
 */
export async function GET(): Promise<NextResponse> {
	try {
		const rateLimiter = getScrapingRateLimiter();
		const status = await rateLimiter.getStatus('scraping_trigger');
		const scrapingService = getScrapingService();

		return NextResponse.json({
			message: 'Keep Rates Scraping API',
			version: '1.0.0',
			rateLimit: {
				windowMs: 60 * 60 * 1000, // 1 hour
				maxRequests: 1,
				remaining: status.remaining,
				resetTime: status.resetTime
			},
			availableBanks: scrapingService.getAvailableBanks(),
			endpoints: {
				trigger: {
					method: 'POST',
					description: 'Trigger scraping of exchange rates',
					authentication: 'API Key (X-API-Key header)',
					rateLimit: '1 request per hour'
				}
			},
			usage: {
				examples: {
					triggerAll: {
						method: 'POST',
						headers: { 'X-API-Key': 'your-api-key' },
						body: { async: true }
					},
					triggerSpecific: {
						method: 'POST',
						headers: { 'X-API-Key': 'your-api-key' },
						body: { banks: ['combank', 'ndb'], async: true }
					}
				}
			}
		});
	} catch (error) {
		console.error('💥 Scraping API GET error:', error);
		
		return NextResponse.json(
			{
				error: 'Internal server error',
				message: 'Failed to retrieve API information'
			},
			{ status: 500 }
		);
	}
}
