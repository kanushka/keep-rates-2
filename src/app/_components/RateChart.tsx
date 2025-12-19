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

interface RateData {
	scrapedAt: Date;
	buyingRate: string | null;
	sellingRate: string | null;
	telegraphicBuyingRate: string | null;
}

interface RateChartProps {
	data: RateData[];
	bankName: string;
}

export function RateChart({ data, bankName }: RateChartProps) {
	if (!data || data.length === 0) {
		return (
			<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
				<div className="text-center">
					<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					<p className="text-gray-500 font-medium">No Data Available</p>
					<p className="text-gray-400 text-sm">Historical rates will appear here</p>
				</div>
			</div>
		);
	}

	// Reverse data to show oldest to newest
	const sortedData = [...data].reverse();

	// Create labels and track unique dates for x-axis display
	const labels = sortedData.map(item => {
		const date = new Date(item.scrapedAt);
		return date.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric'
		});
	});

	// Calculate max value from all data points to add padding at top
	let maxValue = 0;
	sortedData.forEach(item => {
		if (item.buyingRate) {
			const value = parseFloat(item.buyingRate);
			if (value > maxValue) maxValue = value;
		}
		if (item.sellingRate) {
			const value = parseFloat(item.sellingRate);
			if (value > maxValue) maxValue = value;
		}
		if (item.telegraphicBuyingRate) {
			const value = parseFloat(item.telegraphicBuyingRate);
			if (value > maxValue) maxValue = value;
		}
	});
	// Add +2 padding to the top
	const maxValueWithPadding = maxValue + 1;

	const chartData = {
		labels,
		datasets: [
			{
				label: 'Buying Rate',
				data: sortedData.map(item => item.buyingRate ? parseFloat(item.buyingRate) : null).filter(rate => rate !== null),
				borderColor: 'rgb(34, 197, 94)',
				backgroundColor: 'rgba(34, 197, 94, 0.1)',
				tension: 0.1,
				pointRadius: 0,
				pointHoverRadius: 5,
			},
			{
				label: 'Selling Rate',
				data: sortedData.map(item => item.sellingRate ? parseFloat(item.sellingRate) : null).filter(rate => rate !== null),
				borderColor: 'rgb(59, 130, 246)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.1,
				pointRadius: 0,
				pointHoverRadius: 5,
			},
			{
				label: 'Telegraphic Buying Rate',
				data: sortedData.map(item => item.telegraphicBuyingRate ? parseFloat(item.telegraphicBuyingRate) : null).filter(rate => rate !== null),
				borderColor: 'rgb(168, 85, 247)',
				backgroundColor: 'rgba(168, 85, 247, 0.1)',
				tension: 0.1,
				pointRadius: 0,
				pointHoverRadius: 5,
				borderDash: [5, 5],
			},
		],
	};

	const options: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top' as const,
				labels: {
					usePointStyle: true,
					padding: 20,
				},
			},
			title: {
				display: true,
				text: `${bankName} USD/LKR Exchange Rates`,
				font: {
					size: 16,
					weight: 'bold',
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
						if (dataIndex === undefined || !sortedData[dataIndex]) {
							return '';
						}
						const date = new Date(sortedData[dataIndex].scrapedAt);
						return date.toLocaleDateString('en-US', { 
							month: 'short', 
							day: 'numeric',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						});
					},
					label: function(context) {
						if (context.parsed.y === null || context.parsed.y === undefined) {
							return `${context.dataset.label}: N/A`;
						}
						return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} LKR`;
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
