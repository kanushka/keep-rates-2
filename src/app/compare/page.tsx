import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HydrateClient } from "~/trpc/server";
import { DataDisclaimerBanner } from "~/app/_components/DataDisclaimerBanner";
import CompareSection from "./_components/CompareSection";
import CompareSkeleton from "./_components/CompareSkeleton";

export const metadata = {
	title: "Compare Banks - USD/LKR Exchange Rates | Keep Rates",
	description: "Compare USD/LKR exchange rates across all major Sri Lankan banks. View historical trends and find the best rates.",
};

export default function ComparePage() {
	return (
		<HydrateClient>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
				<DataDisclaimerBanner />
				{/* Header */}
				<header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
					<div className="container mx-auto max-w-6xl px-4">
						<div className="flex items-center justify-between h-16">
							<div className="flex items-center space-x-4">
								<Link
									href="/"
									className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
									<span>Back to Home</span>
								</Link>
							</div>
							<Link href="/" className="flex items-center space-x-2">
								<Image
									src="/favicon/apple-touch-icon.png"
									alt="Keep Rates Logo"
									width={32}
									height={32}
									className="w-8 h-8"
									priority
								/>
								<span className="text-xl font-bold text-gray-900">Keep Rates</span>
							</Link>
						</div>
					</div>
				</header>

				<main className="py-8 px-4">
					<div className="container mx-auto max-w-6xl">
						{/* Page Header */}
						<div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white mb-8">
							<div className="flex items-center space-x-4 mb-4">
								<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								<div>
									<h1 className="text-3xl font-bold">Compare Bank Rates</h1>
									<p className="text-white/80 text-lg">
										View and compare USD/LKR exchange rates across all banks
									</p>
								</div>
							</div>
							<div className="bg-white/10 rounded-lg p-4 mt-6">
								<p className="text-sm text-white/90">
									Select a rate type below to compare historical trends from all commercial banks over the last 7 days.
								</p>
							</div>
						</div>

						{/* Compare Section */}
						<Suspense fallback={<CompareSkeleton />}>
							<CompareSection />
						</Suspense>
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
