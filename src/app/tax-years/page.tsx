import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { DataDisclaimerBanner } from "~/app/_components/DataDisclaimerBanner";
import { Header } from "~/app/_components/Header";

export const metadata = {
	title: "Tax Years - Historical Rate Summaries | Keep Rates",
	description: "View tax year summaries of USD/LKR exchange rates for tax filing purposes. Monthly summaries, date-specific analysis, and export functionality.",
};

export default function TaxYearsPage() {
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
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
									</div>
								</div>

								{/* Title */}
								<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
									Coming Soon
								</h1>

								{/* Description */}
								<p className="text-xl text-gray-600 mb-8 leading-relaxed">
									We're building comprehensive tax year summary features to help you with your tax filings. 
									Access monthly summaries, date-specific analysis, and export functionality for all your tax reporting needs.
								</p>

								{/* Features List */}
								<div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
									<h2 className="text-lg font-semibold text-gray-900 mb-4">What to expect:</h2>
									<ul className="space-y-3 text-gray-700">
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Tax year periods (April to March) with monthly summaries</span>
										</li>
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Minimum, maximum, and average rates for each month</span>
										</li>
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Date-specific analysis for any day of the month</span>
										</li>
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Export to CSV/PDF for tax filing purposes</span>
										</li>
										<li className="flex items-start">
											<svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>Multi-bank comparison and consolidated averages</span>
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

