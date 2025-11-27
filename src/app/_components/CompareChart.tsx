"use client";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface BankRate {
	scrapedAt: Date;
	buyingRate: string | null;
	sellingRate: string | null;
	telegraphicBuyingRate: string | null;
}

interface BankData {
	bankCode: string;
	bankName: string;
	rates: BankRate[];
}

interface CompareChartProps {
	data: BankData[];
	rateType: 'telegraphicBuying' | 'selling' | 'buying';
}

// Color palette for different banks
const BANK_COLORS = [
	{ border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.1)' }, // Blue
	{ border: 'rgb(34, 197, 94)', background: 'rgba(34, 197, 94, 0.1)' }, // Green
	{ border: 'rgb(168, 85, 247)', background: 'rgba(168, 85, 247, 0.1)' }, // Purple
	{ border: 'rgb(251, 146, 60)', background: 'rgba(251, 146, 60, 0.1)' }, // Orange
	{ border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.1)' }, // Pink
	{ border: 'rgb(14, 165, 233)', background: 'rgba(14, 165, 233, 0.1)' }, // Sky
	{ border: 'rgb(132, 204, 22)', background: 'rgba(132, 204, 22, 0.1)' }, // Lime
	{ border: 'rgb(244, 63, 94)', background: 'rgba(244, 63, 94, 0.1)' }, // Rose
];

export function CompareChart({ data, rateType }: CompareChartProps) {
	if (!data || data.length === 0) {
		return (
			<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
				<div className="text-center">
					<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					<p className="text-gray-500 font-medium">No Data Available</p>
					<p className="text-gray-400 text-sm">Bank comparison data will appear here</p>
				</div>
			</div>
		);
	}

	// Collect all unique timestamps from all banks
	const allTimestamps = new Set<string>();
	data.forEach(bank => {
		bank.rates.forEach(rate => {
			const date = new Date(rate.scrapedAt);
			allTimestamps.add(date.toISOString());
		});
	});

	// Sort timestamps
	const sortedTimestamps = Array.from(allTimestamps).sort();

	// Get the appropriate rate field based on rate type
	const getRateValue = (rate: BankRate): string | null => {
		switch (rateType) {
			case 'telegraphicBuying':
				return rate.telegraphicBuyingRate;
			case 'selling':
				return rate.sellingRate;
			case 'buying':
				return rate.buyingRate;
			default:
				return null;
		}
	};

	// Get label based on rate type
	const getRateLabel = (): string => {
		switch (rateType) {
			case 'telegraphicBuying':
				return 'Telegraphic Buying Rate';
			case 'selling':
				return 'Selling Rate';
			case 'buying':
				return 'Buying Rate';
			default:
				return 'Rate';
		}
	};

	const chartData = {
		labels: sortedTimestamps.map(timestamp => {
			const date = new Date(timestamp);
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}),
		datasets: data.map((bank, index) => {
			const color = BANK_COLORS[index % BANK_COLORS.length];

			// Create a map of timestamp to rate for this bank
			const rateMap = new Map<string, number>();
			bank.rates.forEach(rate => {
				const timestamp = new Date(rate.scrapedAt).toISOString();
				const rateValue = getRateValue(rate);
				if (rateValue) {
					rateMap.set(timestamp, parseFloat(rateValue));
				}
			});

			// Map sorted timestamps to rates (null if no data at that timestamp)
			const dataPoints = sortedTimestamps.map(timestamp =>
				rateMap.get(timestamp) ?? null
			);

			return {
				label: bank.bankName,
				data: dataPoints,
				borderColor: color?.border,
				backgroundColor: color?.background,
				tension: 0.1,
				pointRadius: 3,
				pointHoverRadius: 5,
				spanGaps: true, // Connect points even if there are gaps
			};
		}),
	};

	const options: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top' as const,
				labels: {
					usePointStyle: true,
					padding: 15,
					font: {
						size: 12,
					},
				},
			},
			title: {
				display: true,
				text: `Bank Comparison - ${getRateLabel()}`,
				font: {
					size: 18,
					weight: 'bold',
				},
				padding: {
					top: 10,
					bottom: 20,
				},
			},
			tooltip: {
				mode: 'index',
				intersect: false,
				callbacks: {
					label: function(context) {
						const value = context.parsed.y;
						if (value === null) return `${context.dataset.label}: No data`;
						return `${context.dataset.label}: ${value.toFixed(2)} LKR`;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: false,
				title: {
					display: true,
					text: 'Rate (LKR per USD)',
					font: {
						size: 12,
						weight: 'bold',
					},
				},
				ticks: {
					callback: function(value) {
						return value + ' LKR';
					},
				},
			},
			x: {
				title: {
					display: true,
					text: 'Date & Time',
					font: {
						size: 12,
						weight: 'bold',
					},
				},
				ticks: {
					maxRotation: 45,
					minRotation: 45,
				},
			},
		},
		interaction: {
			mode: 'nearest',
			axis: 'x',
			intersect: false,
		},
	};

	return (
		<div className="h-96">
			<Line data={chartData} options={options} />
		</div>
	);
}
