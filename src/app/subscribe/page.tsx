import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { DataDisclaimerBanner } from "~/app/_components/DataDisclaimerBanner";
import { Header } from "~/app/_components/Header";

export const metadata = {
	title: "Subscribe - Email Updates | Keep Rates",
	description: "Subscribe to receive daily USD/LKR exchange rate updates via email from Keep Rates.",
};

export default function SubscribePage() {
	return (
		<HydrateClient>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
				<DataDisclaimerBanner />
				<Header />

				<main className="py-16 px-4">
					<div className="container mx-auto max-w-4xl">
						{/* Coming Soon Section */}
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
							<div className="max-w-2xl mx-auto">
								{/* Icon */}
								<div className="mb-6 flex justify-center">
									<div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-slate-400 rounded-full flex items-center justify-center">
										<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
								</div>

								{/* Title */}
								<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
									Coming Soon
								</h1>

								{/* Description */}
								<p className="text-xl text-gray-600 mb-8 leading-relaxed">
									We're working hard to bring you email subscription features. 
									Subscribe to receive daily USD/LKR exchange rate updates and stay informed about the latest rates from all major banks.
								</p>

								{/* Features List */}
								<div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
									<h2 className="text-lg font-semibold text-gray-900 mb-4">What to expect:</h2>
									<ul className="space-y-3 text-gray-700">
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Daily email digest with current exchange rates</span>
										</li>
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Rate change alerts and notifications</span>
										</li>
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Best rate notifications when banks offer competitive rates</span>
										</li>
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Customizable subscription preferences</span>
										</li>
									</ul>
								</div>

								{/* CTA Buttons */}
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link
										href="/"
										className="bg-gradient-to-br from-gray-800 to-slate-400 text-white px-8 py-3 rounded-lg hover:bg-gradient-to-b hover:from-gray-800 hover:to-slate-400 transition-all font-medium"
									>
										Back to Home
									</Link>
									<Link
										href="/compare"
										className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
									>
										Compare Rates
									</Link>
								</div>
							</div>
						</div>
					</div>
				</main>

				{/* Footer */}
				<footer className="bg-gray-900 text-white py-8 mt-12">
					<div className="container mx-auto max-w-6xl px-4 text-center">
						<p className="text-gray-400">
							Built with ❤️ for the Sri Lankan community
						</p>
						<p className="text-sm text-gray-500 mt-2">
							Keep Rates - The easiest way to get USD/LKR exchange rate information
						</p>
					</div>
				</footer>
			</div>
		</HydrateClient>
	);
}

