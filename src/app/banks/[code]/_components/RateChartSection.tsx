"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { RateChart } from "~/app/_components/RateChart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/app/_components/ui/select";
import { RateChartSkeletonChart } from "./RateChartSkeleton";

interface RateChartSectionProps {
	bankCode: string;
	bankName: string;
}

type TimeRange = 7 | 30 | 90;

const timeRangeOptions: { value: TimeRange; label: string }[] = [
	{ value: 7, label: "Last 7 Days" },
	{ value: 30, label: "Last 30 Days" },
	{ value: 90, label: "Last 3 Months" },
];

export default function RateChartSection({ bankCode, bankName }: RateChartSectionProps) {
	const [selectedDays, setSelectedDays] = useState<TimeRange>(7);
	
	const { data: historicalRates, isLoading } = api.exchangeRates.getHistoryByBank.useQuery({
		bankCode,
		days: selectedDays,
	});

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
				<h2 className="text-xl font-semibold text-gray-900">Rate Chart</h2>
				<div className="flex items-center gap-3">
					<label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
						Time Range:
					</label>
					<Select
						value={selectedDays.toString()}
						onValueChange={(value) => setSelectedDays(Number(value) as TimeRange)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select time range" />
						</SelectTrigger>
						<SelectContent>
							{timeRangeOptions.map((option) => (
								<SelectItem key={option.value} value={option.value.toString()}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			
			{isLoading ? (
				<RateChartSkeletonChart />
			) : (
				<RateChart data={historicalRates || []} bankName={bankName} />
			)}
		</div>
	);
}
