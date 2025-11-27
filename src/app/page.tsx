import { Suspense } from "react";
import { BankGrid } from "~/app/_components/BankGrid";
import { Hero } from "~/app/_components/Hero";
import { Features } from "~/app/_components/Features";
import { Header } from "~/app/_components/Header";
import { DataDisclaimerBanner } from "~/app/_components/DataDisclaimerBanner";
import { HydrateClient } from "~/trpc/server";

export default function Home() {
	return (
		<HydrateClient>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
				<DataDisclaimerBanner />
				<Header />
				
				<main>
					{/* Hero Section */}
					<Hero />
					
					{/* Banks Section */}
					<section className="py-16 px-4 bg-gray-50">
						<div className="container mx-auto max-w-6xl">
							<div className="text-center mb-12">
								<h2 className="text-3xl font-bold text-gray-900 mb-4">
									Track USD/LKR Rates from Leading Banks
								</h2>
								<p className="text-lg text-gray-600 max-w-2xl mx-auto">
									Get real-time exchange rates from Sri Lanka's top banks. 
									Click on any bank to view detailed rate information and historical data.
								</p>
							</div>
							
							<Suspense 
								fallback={
									<div className="flex justify-center items-center py-12">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
									</div>
								}
							>
								<BankGrid />
							</Suspense>
						</div>
					</section>
				</main>
				
				{/* Footer */}
				<footer className="bg-gray-900 text-white py-8">
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
