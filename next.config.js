/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	// Serverless function optimizations for Puppeteer
	serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
	
	// Optimize for serverless deployment
	output: 'standalone',
	
	// Increase function timeout and memory for scraping operations
	async headers() {
		return [
			{
				source: '/api/scrape/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate',
					},
				],
			},
		];
	},
	
	// Webpack configuration for Chromium (only used when not using Turbopack)
	webpack: (config, { isServer, dev }) => {
		// Only apply webpack config when not using Turbopack
		if (!dev || process.env.TURBOPACK !== '1') {
			if (isServer) {
				// Exclude Chromium from server bundle to reduce size
				config.externals = config.externals || [];
				config.externals.push('@sparticuz/chromium');
			}
		}
		return config;
	},
};

export default config;
