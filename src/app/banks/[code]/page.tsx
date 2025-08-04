import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { getBankStyling } from "~/app/utils/bank-styling";

interface BankPageProps {
	params: {
		code: string;
	};
}

export default async function BankPage({ params }: BankPageProps) {
	const bank = await api.banks.getByCode({ code: params.code });

	if (!bank) {
		notFound();
	}

	const styling = getBankStyling(bank.code);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
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
							<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">KR</span>
							</div>
							<span className="text-xl font-bold text-gray-900">Keep Rates</span>
						</Link>
					</div>
				</div>
			</header>

			<main className="py-8 px-4">
				<div className="container mx-auto max-w-4xl">
					{/* Bank Header */}
					<div className={`bg-gradient-to-r ${styling.bgGradient} rounded-2xl p-8 text-white mb-8`}>
						<div className="flex items-center space-x-4 mb-6">
							<span className="text-4xl">{styling.icon}</span>
							<div>
								<h1 className="text-3xl font-bold">{bank.name}</h1>
								<p className="text-white/80 text-lg">
									{bank.bankType === 'central' ? 'Central Bank of Sri Lanka' : 'Commercial Bank'}
								</p>
							</div>
							<div className="ml-auto bg-white/20 px-4 py-2 rounded-full">
								<span className="font-medium">{bank.code.toUpperCase()}</span>
							</div>
						</div>

						{/* Status and Info */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white/10 rounded-lg p-4">
								<div className="text-white/70 text-sm mb-1">Status</div>
								<div className="flex items-center space-x-2">
									<div className={`w-2 h-2 rounded-full ${bank.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
									<span className="font-medium">{bank.isActive ? 'Active' : 'Inactive'}</span>
								</div>
							</div>
							<div className="bg-white/10 rounded-lg p-4">
								<div className="text-white/70 text-sm mb-1">Rate Type</div>
								<div className="font-medium">
									{bank.bankType === 'central' ? 'Indicative Rate' : 'Buy/Sell Rates'}
								</div>
							</div>
							<div className="bg-white/10 rounded-lg p-4">
								<div className="text-white/70 text-sm mb-1">Update Frequency</div>
								<div className="font-medium">
									{bank.bankType === 'central' ? 'Daily' : 'Hourly'}
								</div>
							</div>
						</div>
					</div>

					{/* Current Rates Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-6">Current Rates</h2>
							<div className="space-y-4">
								{bank.bankType === 'central' ? (
									<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
										<div className="text-purple-700 text-sm mb-2">Official Indicative Rate</div>
										<div className="text-2xl font-bold text-purple-900">Coming Soon</div>
										<div className="text-purple-600 text-sm mt-1">Updated daily by CBSL</div>
									</div>
								) : (
									<>
										<div className="bg-green-50 border border-green-200 rounded-lg p-4">
											<div className="text-green-700 text-sm mb-2">Buying Rate</div>
											<div className="text-2xl font-bold text-green-900">Coming Soon</div>
											<div className="text-green-600 text-sm mt-1">Rate when bank buys USD</div>
										</div>
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
											<div className="text-blue-700 text-sm mb-2">Selling Rate</div>
											<div className="text-2xl font-bold text-blue-900">Coming Soon</div>
											<div className="text-blue-600 text-sm mt-1">Rate when bank sells USD</div>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Quick Stats */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Today's High</span>
									<span className="font-medium text-gray-400">Coming Soon</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Today's Low</span>
									<span className="font-medium text-gray-400">Coming Soon</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">24h Change</span>
									<span className="font-medium text-gray-400">Coming Soon</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Last Updated</span>
									<span className="font-medium text-gray-400">Coming Soon</span>
								</div>
							</div>
						</div>
					</div>

					{/* Chart Placeholder */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
						<h2 className="text-xl font-semibold text-gray-900 mb-6">Rate Chart</h2>
						<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
							<div className="text-center">
								<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								<p className="text-gray-500 font-medium">Interactive Rate Chart</p>
								<p className="text-gray-400 text-sm">Coming soon with historical data</p>
							</div>
						</div>
					</div>

					{/* Bank Information */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-6">Bank Information</h2>
						<div className="space-y-4">
							<div>
								<span className="text-gray-600 text-sm">Official Name</span>
								<div className="font-medium">{bank.name}</div>
							</div>
							<div>
								<span className="text-gray-600 text-sm">Bank Code</span>
								<div className="font-medium">{bank.code.toUpperCase()}</div>
							</div>
							<div>
								<span className="text-gray-600 text-sm">Type</span>
								<div className="font-medium">
									{bank.bankType === 'central' ? 'Central Bank' : 'Commercial Bank'}
								</div>
							</div>
							{bank.websiteUrl && (
								<div>
									<span className="text-gray-600 text-sm">Website</span>
									<div>
										<a 
											href={bank.websiteUrl} 
											target="_blank" 
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-700 underline"
										>
											View Exchange Rates Page
										</a>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
