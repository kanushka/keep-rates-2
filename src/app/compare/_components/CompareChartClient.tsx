"use client";

import { useState } from "react";
import { CompareChart } from "~/app/_components/CompareChart";

type RateType = 'telegraphicBuying' | 'selling' | 'buying';

interface BankRate {
	scrapedAt: Date;
	buyingRate: string | null;
	sellingRate: string | null;
	telegraphicBuyingRate: string | null;
}

interface BankData {
	bankId: number;
	bankCode: string;
	bankName: string;
	rates: BankRate[];
}

interface CompareChartClientProps {
	banksData: BankData[];
}

export default function CompareChartClient({ banksData }: CompareChartClientProps) {
	const [selectedRateType, setSelectedRateType] = useState<RateType>('telegraphicBuying');

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Select Rate Type</h2>
				<div className="flex flex-wrap gap-3">
					<button
						onClick={() => setSelectedRateType('telegraphicBuying')}
						className={`px-6 py-3 rounded-lg font-medium transition-all ${
							selectedRateType === 'telegraphicBuying'
								? 'bg-purple-600 text-white shadow-md'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Telegraphic Buying Rate
					</button>
					<button
						onClick={() => setSelectedRateType('selling')}
						className={`px-6 py-3 rounded-lg font-medium transition-all ${
							selectedRateType === 'selling'
								? 'bg-blue-600 text-white shadow-md'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Selling Rate
					</button>
					<button
						onClick={() => setSelectedRateType('buying')}
						className={`px-6 py-3 rounded-lg font-medium transition-all ${
							selectedRateType === 'buying'
								? 'bg-green-600 text-white shadow-md'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Buying Rate
					</button>
				</div>
			</div>

			<div className="border-t border-gray-200 pt-6">
				<CompareChart data={banksData} rateType={selectedRateType} />
			</div>

			{/* Info Section */}
			<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex items-start space-x-3">
					<svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
					</svg>
					<div>
						<h3 className="font-semibold text-blue-900 mb-1">About Rate Types</h3>
						<ul className="text-sm text-blue-800 space-y-1">
							<li><strong>Telegraphic Buying Rate:</strong> Rate for incoming foreign currency transfers</li>
							<li><strong>Selling Rate:</strong> Rate when you buy foreign currency from the bank</li>
							<li><strong>Buying Rate:</strong> Rate when you sell foreign currency to the bank</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
