import { api } from "~/trpc/server";

interface QuickStatsProps {
	bankCode: string;
}

export default async function QuickStats({ bankCode }: QuickStatsProps) {
	const todayStats = await api.exchangeRates.getTodayStats({ bankCode });

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<span className="text-gray-600">Today's High</span>
				<span className="font-medium">
					{todayStats?.high ? `${todayStats.high.toFixed(2)} LKR` : 'No data'}
				</span>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-gray-600">Today's Low</span>
				<span className="font-medium">
					{todayStats?.low ? `${todayStats.low.toFixed(2)} LKR` : 'No data'}
				</span>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-gray-600">24h Change</span>
				<span className={`font-medium ${todayStats?.change && todayStats.change > 0 ? 'text-green-600' : todayStats?.change && todayStats.change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
					{todayStats?.change ? `${todayStats.change > 0 ? '+' : ''}${todayStats.change.toFixed(2)} LKR` : 'No data'}
				</span>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-gray-600">Last Updated</span>
				<span className="font-medium text-gray-900">
					{todayStats?.lastUpdated ? new Date(todayStats.lastUpdated).toLocaleString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					}) : 'No data'}
				</span>
			</div>
		</div>
	);
} 
