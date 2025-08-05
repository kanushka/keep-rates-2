import { api } from "~/trpc/server";
import { RateChart } from "~/app/_components/RateChart";

interface RateChartSectionProps {
	bankCode: string;
	bankName: string;
}

export default async function RateChartSection({ bankCode, bankName }: RateChartSectionProps) {
	const historicalRates = await api.exchangeRates.getHistoryByBank({ bankCode, days: 7 });

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-6">Rate Chart (Last 7 Days)</h2>
			<RateChart data={historicalRates} bankName={bankName} />
		</div>
	);
} 
