import { api } from "~/trpc/server";

interface CurrentRatesProps {
	bankCode: string;
	bankType: string;
}

export default async function CurrentRates({ bankCode, bankType }: CurrentRatesProps) {
	const latestRate = await api.exchangeRates.getLatestByBank({ bankCode });

	return (
		<div className="space-y-4">
			{bankType === 'central' ? (
				<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
					<div className="text-purple-700 text-sm mb-2">Official Indicative Rate</div>
					<div className="text-2xl font-bold text-purple-900">
						{latestRate?.indicativeRate ? `${parseFloat(latestRate.indicativeRate).toFixed(2)} LKR` : 'Coming Soon'}
					</div>
					<div className="text-purple-600 text-sm mt-1">Updated daily by CBSL</div>
				</div>
			) : (
				<>
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<div className="text-green-700 text-sm mb-2">Buying Rate</div>
						<div className="text-2xl font-bold text-green-900">
							{latestRate?.buyingRate ? `${parseFloat(latestRate.buyingRate).toFixed(2)} LKR` : 'Coming Soon'}
						</div>
						<div className="text-green-600 text-sm mt-1">Rate when bank buys USD</div>
					</div>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="text-blue-700 text-sm mb-2">Selling Rate</div>
						<div className="text-2xl font-bold text-blue-900">
							{latestRate?.sellingRate ? `${parseFloat(latestRate.sellingRate).toFixed(2)} LKR` : 'Coming Soon'}
						</div>
						<div className="text-blue-600 text-sm mt-1">Rate when bank sells USD</div>
					</div>
					{latestRate?.telegraphicBuyingRate && (
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
							<div className="text-purple-700 text-sm mb-2">Telegraphic Buying Rate</div>
							<div className="text-2xl font-bold text-purple-900">
								{parseFloat(latestRate.telegraphicBuyingRate).toFixed(2)} LKR
							</div>
							<div className="text-purple-600 text-sm mt-1">Rate for online transfers</div>
						</div>
					)}
				</>
			)}
		</div>
	);
} 
