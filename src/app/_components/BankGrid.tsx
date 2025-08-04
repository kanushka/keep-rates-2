"use client";

import { api } from "~/trpc/react";
import { BankCard } from "./BankCard";

export function BankGrid() {
	const { data: banks, isLoading, error } = api.banks.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
						<div className="bg-gray-300 h-24"></div>
						<div className="p-6 space-y-4">
							<div className="h-4 bg-gray-300 rounded w-3/4"></div>
							<div className="h-4 bg-gray-300 rounded w-1/2"></div>
							<div className="h-12 bg-gray-200 rounded"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
					<h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Banks</h3>
					<p className="text-red-600">Failed to load bank information. Please try again later.</p>
				</div>
			</div>
		);
	}

	if (!banks || banks.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
					<h3 className="text-lg font-medium text-gray-800 mb-2">No Banks Found</h3>
					<p className="text-gray-600">No banks are currently available for tracking.</p>
				</div>
			</div>
		);
	}

	// Separate commercial banks and central bank
	const commercialBanks = banks.filter(bank => bank.bankType === 'commercial');
	const centralBank = banks.find(bank => bank.bankType === 'central');

	return (
		<div className="space-y-8">
			{/* Commercial Banks */}
			{commercialBanks.length > 0 && (
				<div>
					<h3 className="text-xl font-semibold text-gray-900 mb-6">Commercial Banks</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{commercialBanks.map((bank) => (
							<BankCard key={bank.id} bank={bank} />
						))}
					</div>
				</div>
			)}

			{/* Central Bank */}
			{centralBank && (
				<div>
					<h3 className="text-xl font-semibold text-gray-900 mb-6">Central Bank</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<BankCard bank={centralBank} />
					</div>
				</div>
			)}
		</div>
	);
}
