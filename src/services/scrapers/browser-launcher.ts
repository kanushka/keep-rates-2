import puppeteer, { type Browser, type LaunchOptions } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export interface ServerlessBrowserOptions {
	timeout?: number;
	maxConcurrency?: number;
	headless?: boolean;
}

export class ServerlessBrowserLauncher {
	private static instance: ServerlessBrowserLauncher;
	private browserPool: Browser[] = [];
	private maxConcurrency: number;
	private isServerless: boolean;

	private constructor(options: ServerlessBrowserOptions = {}) {
		this.maxConcurrency = options.maxConcurrency || 1;
		this.isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
	}

	static getInstance(options?: ServerlessBrowserOptions): ServerlessBrowserLauncher {
		if (!ServerlessBrowserLauncher.instance) {
			ServerlessBrowserLauncher.instance = new ServerlessBrowserLauncher(options);
		}
		return ServerlessBrowserLauncher.instance;
	}

	async launchBrowser(): Promise<Browser> {
		const launchOptions: LaunchOptions = {
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
				'--no-first-run',
				'--no-zygote',
				'--single-process',
				'--disable-extensions',
				'--disable-background-timer-throttling',
				'--disable-backgrounding-occluded-windows',
				'--disable-renderer-backgrounding',
				'--disable-features=TranslateUI',
				'--disable-ipc-flooding-protection',
				'--disable-default-apps',
				'--disable-sync',
				'--metrics-recording-only',
				'--no-default-browser-check',
				'--mute-audio',
				'--no-first-run',
				'--safebrowsing-disable-auto-update',
				'--disable-component-extensions-with-background-pages',
				'--disable-background-networking',
				'--disable-background-timer-throttling',
				'--disable-client-side-phishing-detection',
				'--disable-default-apps',
				'--disable-extensions',
				'--disable-sync',
				'--disable-translate',
				'--hide-scrollbars',
				'--mute-audio',
				'--no-first-run',
				'--safebrowsing-disable-auto-update',
				'--ignore-certificate-errors',
				'--ignore-ssl-errors',
				'--ignore-certificate-errors-spki-list',
				'--disable-web-security',
				'--disable-features=VizDisplayCompositor',
			],
			defaultViewport: { width: 1280, height: 720 },
		};

		if (this.isServerless) {
			// Serverless environment - use @sparticuz/chromium
			launchOptions.executablePath = await chromium.executablePath();
			launchOptions.args = [
				...chromium.args,
				...(launchOptions.args || []),
			];
		} else {
			// Local development - use system Chrome
			const { executablePath } = await import('puppeteer');
			launchOptions.executablePath = process.env.CHROME_EXECUTABLE_PATH || executablePath();
		}

		try {
			const browser = await puppeteer.launch(launchOptions);
			
			// Set up browser event listeners for cleanup
			browser.on('disconnected', () => {
				this.browserPool = this.browserPool.filter(b => b !== browser);
			});

			return browser;
		} catch (error) {
			console.error('Failed to launch browser:', error);
			throw new Error(`Browser launch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async getBrowser(): Promise<Browser> {
		// For serverless, always create a new browser instance
		if (this.isServerless) {
			return this.launchBrowser();
		}

		// For local development, reuse browser if available
		if (this.browserPool.length > 0) {
			const browser = this.browserPool[0];
			if (browser) {
				try {
					// Check if browser is still connected
					const version = await browser.version();
					return browser;
				} catch {
					// Browser disconnected, remove from pool
					this.browserPool = this.browserPool.filter(b => b !== browser);
				}
			}
		}

		const browser = await this.launchBrowser();
		this.browserPool.push(browser);
		return browser;
	}

	async closeBrowser(browser: Browser): Promise<void> {
		try {
			if (this.isServerless) {
				// Always close browser in serverless environment
				await browser.close();
			} else {
				// Keep browser in pool for local development
				if (!this.browserPool.includes(browser)) {
					await browser.close();
				}
			}
		} catch (error) {
			console.error('Error closing browser:', error);
		}
	}

	async cleanup(): Promise<void> {
		const closePromises = this.browserPool.map(browser => this.closeBrowser(browser));
		await Promise.allSettled(closePromises);
		this.browserPool = [];
	}
}

// Export singleton instance
export const browserLauncher = ServerlessBrowserLauncher.getInstance(); 
