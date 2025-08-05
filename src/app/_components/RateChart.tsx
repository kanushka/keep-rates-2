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

	const chartData = {
		labels: sortedData.map(item => {
			const date = new Date(item.scrapedAt);
			return date.toLocaleDateString('en-US', { 
				month: 'short', 
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}),
		datasets: [
			{
				label: 'Buying Rate',
				data: sortedData.map(item => item.buyingRate ? parseFloat(item.buyingRate) : null).filter(rate => rate !== null),
				borderColor: 'rgb(34, 197, 94)',
				backgroundColor: 'rgba(34, 197, 94, 0.1)',
				tension: 0.1,
				pointRadius: 3,
				pointHoverRadius: 5,
			},
			{
				label: 'Selling Rate',
				data: sortedData.map(item => item.sellingRate ? parseFloat(item.sellingRate) : null).filter(rate => rate !== null),
				borderColor: 'rgb(59, 130, 246)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.1,
				pointRadius: 3,
				pointHoverRadius: 5,
			},
			{
				label: 'Telegraphic Buying Rate',
				data: sortedData.map(item => item.telegraphicBuyingRate ? parseFloat(item.telegraphicBuyingRate) : null).filter(rate => rate !== null),
				borderColor: 'rgb(168, 85, 247)',
				backgroundColor: 'rgba(168, 85, 247, 0.1)',
				tension: 0.1,
				pointRadius: 3,
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
					label: function(context) {
						return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} LKR`;
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
		<div className="h-64">
			<Line data={chartData} options={options} />
		</div>
	);
} 
