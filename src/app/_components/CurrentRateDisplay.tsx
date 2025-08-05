"use client";

import { api } from "~/trpc/react";
import { useState, useEffect } from "react";

interface CurrentRateDisplayProps {
	bankCode: string;
	bankType: string;
}

export function CurrentRateDisplay({ bankCode, bankType }: CurrentRateDisplayProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [hasIntersected, setHasIntersected] = useState(false);

	// Only fetch data when component is visible and has intersected
	const { data: latestRate, isLoading, error } = api.exchangeRates.getLatestByBank.useQuery(
		{ bankCode },
		{
			enabled: isVisible && hasIntersected,
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
		}
	);

	// Intersection Observer to detect when card comes into view
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasIntersected) {
					setIsVisible(true);
					setHasIntersected(true);
				}
			},
			{
				rootMargin: "50px", // Start loading 50px before the card is visible
				threshold: 0.1,
			}
		);

		const element = document.querySelector(`[data-bank-code="${bankCode}"]`);
		if (element) {
			observer.observe(element);
		}

		return () => {
			if (element) {
				observer.unobserve(element);
			}
		};
	}, [bankCode, hasIntersected]);

	if (!hasIntersected) {
		return (
			<div className="flex items-center justify-between">
				<span className="text-sm text-gray-600">Current Rate</span>
				<span className="text-sm text-gray-400">Loading...</span>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-between">
				<span className="text-sm text-gray-600">Current Rate</span>
				<div className="flex items-center space-x-2">
					<div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
					<span className="text-sm text-gray-400">Loading...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-between">
				<span className="text-sm text-gray-600">Current Rate</span>
				<span className="text-sm text-red-500">Error</span>
			</div>
		);
	}

	if (!latestRate) {
		return (
			<div className="flex items-center justify-between">
				<span className="text-sm text-gray-600">Current Rate</span>
				<span className="text-sm text-gray-400">No data</span>
			</div>
		);
	}

	// Format the rate based on bank type
	const formatRate = (rate: string | number | null) => {
		if (!rate) return "N/A";
		const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
		return numRate.toFixed(2);
	};

	const getRateDisplay = () => {
		if (bankType === 'central') {
			// Central bank typically has indicative rates
			const rate = latestRate.indicativeRate || latestRate.buyingRate;
			return formatRate(rate);
		} else {
			// Commercial banks have buying/selling rates
			const buyingRate = formatRate(latestRate.buyingRate);
			const sellingRate = formatRate(latestRate.sellingRate);
			return `${buyingRate} / ${sellingRate}`;
		}
	};

	const getRateLabel = () => {
		if (bankType === 'central') {
			return "Indicative";
		} else {
			return "Buy/Sell";
		}
	};

	return (
		<div className="flex items-center justify-between">
			<span className="text-sm text-gray-600">Current Rate</span>
			<div className="text-right">
				<div className="text-sm font-medium text-gray-900">
					{getRateDisplay()}
				</div>
				<div className="text-xs text-gray-500">
					{getRateLabel()} • USD/LKR
				</div>
			</div>
		</div>
	);
} 
