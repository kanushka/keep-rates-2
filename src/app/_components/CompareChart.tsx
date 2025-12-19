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
import { getBankStyling } from '../utils/bank-styling';

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

// Map bank accent colors to RGB values for Chart.js
function getBankColor(bankCode: string): { border: string; background: string } {
	const styling = getBankStyling(bankCode);
	
	// Map Tailwind color names to RGB values (using 600 shade for border, 0.1 opacity for background)
	switch (styling.accent) {
		case 'blue':
			return { border: 'rgb(37, 99, 235)', background: 'rgba(37, 99, 235, 0.1)' }; // blue-600
		case 'red':
			return { border: 'rgb(220, 38, 38)', background: 'rgba(220, 38, 38, 0.1)' }; // red-600
		case 'amber':
			return { border: 'rgb(217, 119, 6)', background: 'rgba(217, 119, 6, 0.1)' }; // amber-600
		case 'purple':
			return { border: 'rgb(147, 51, 234)', background: 'rgba(147, 51, 234, 0.1)' }; // purple-600
		default:
			return { border: 'rgb(75, 85, 99)', background: 'rgba(75, 85, 99, 0.1)' }; // gray-600
	}
}

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

	// Helper function to round timestamp to nearest hour
	const roundToNearestHour = (date: Date): string => {
		const rounded = new Date(date);
		rounded.setMinutes(0, 0, 0);
		return rounded.toISOString();
	};

	// Collect all unique rounded timestamps from all banks
	const allTimestamps = new Set<string>();
	data.forEach(bank => {
		bank.rates.forEach(rate => {
			const roundedTimestamp = roundToNearestHour(new Date(rate.scrapedAt));
			allTimestamps.add(roundedTimestamp);
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

	// Create labels and track unique dates for x-axis display
	const labels = sortedTimestamps.map(timestamp => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	});

	// Calculate max value from all data points to add padding at top
	let maxValue = 0;
	data.forEach(bank => {
		bank.rates.forEach(rate => {
			const rateValue = getRateValue(rate);
			if (rateValue) {
				const value = parseFloat(rateValue);
				if (value > maxValue) {
					maxValue = value;
				}
			}
		});
	});
	// Add +2 padding to the top
	const maxValueWithPadding = maxValue + 1;

	const chartData = {
		labels,
		datasets: data.map((bank) => {
			const color = getBankColor(bank.bankCode);

			// Create a map of rounded timestamp to rate for this bank
			const rateMap = new Map<string, number>();
			bank.rates.forEach(rate => {
				const roundedTimestamp = roundToNearestHour(new Date(rate.scrapedAt));
				const rateValue = getRateValue(rate);
				if (rateValue) {
					rateMap.set(roundedTimestamp, parseFloat(rateValue));
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
				pointRadius: 0,
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
					title: function(context) {
						if (!context || context.length === 0 || !context[0]) {
							return '';
						}
						const dataIndex = context[0].dataIndex;
						if (dataIndex === undefined || !sortedTimestamps[dataIndex]) {
							return '';
						}
						const date = new Date(sortedTimestamps[dataIndex]);
						return date.toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						});
					},
					label: function() {
						// Don't use default labels, we'll build them in afterBody
						return '';
					},
					afterBody: function(context) {
						// Build tooltip body with all banks
						if (!context || context.length === 0 || !context[0]) {
							return [];
						}
						
						const dataIndex = context[0].dataIndex;
						if (dataIndex === undefined || !sortedTimestamps[dataIndex]) {
							return [];
						}
						
						const timestamp = sortedTimestamps[dataIndex];
						const tooltipLabels: string[] = [];
						
						// Show all banks in order
						data.forEach((bank) => {
							// Get the value for this bank at this timestamp
							const rateMap = new Map<string, number>();
							bank.rates.forEach(rate => {
								const roundedTs = roundToNearestHour(new Date(rate.scrapedAt));
								const rateValue = getRateValue(rate);
								if (rateValue) {
									rateMap.set(roundedTs, parseFloat(rateValue));
								}
							});
							
							const value = rateMap.get(timestamp);
							if (value === undefined || value === null) {
								tooltipLabels.push(`${bank.bankName}: No data`);
							} else {
								tooltipLabels.push(`${bank.bankName}: ${value.toFixed(2)} LKR`);
							}
						});
						
						return tooltipLabels;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: false,
				suggestedMax: maxValueWithPadding,
				title: {
					display: true,
					text: 'Rate (LKR per USD)',
					font: {
						size: 12,
						weight: 'bold',
					},
				},
				ticks: {
					stepSize: 2,
					maxTicksLimit: 8,
					callback: function(value) {
						const numValue = typeof value === 'number' ? value : parseFloat(value);
						return numValue.toFixed(2) + ' LKR';
					},
				},
			},
			x: {
				title: {
					display: true,
					text: 'Date',
					font: {
						size: 12,
						weight: 'bold',
					},
				},
				grid: {
					display: false,
				},
				ticks: {
					maxRotation: 45,
					minRotation: 45,
					autoSkip: false,
					callback: function(value, index) {
						// Only show label if it's different from the previous one
						if (index === undefined || index === null) {
							return '';
						}
						const currentLabel = labels[index];
						if (!currentLabel) {
							return '';
						}
						if (index === 0) {
							return currentLabel;
						}
						const previousLabel = labels[index - 1];
						return currentLabel !== previousLabel ? currentLabel : '';
					},
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
