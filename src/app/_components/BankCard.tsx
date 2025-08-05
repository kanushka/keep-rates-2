import Link from "next/link";
import { getBankStyling } from "~/app/utils/bank-styling";
import { CurrentRateDisplay } from "./CurrentRateDisplay";

interface Bank {
	id: number;
	name: string;
	code: string;
	displayName: string;
	websiteUrl: string | null;
	bankType: string;
	isActive: boolean;
}

interface BankCardProps {
	bank: Bank;
}

export function BankCard({ bank }: BankCardProps) {
	const styling = getBankStyling(bank.code);

	return (
		<Link href={`/banks/${bank.code}`}>
			<div 
				className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden"
				data-bank-code={bank.code}
			>
				{/* Header with gradient */}
				<div className={`bg-gradient-to-r ${styling.bgGradient} p-6 text-white`}>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<span className="text-2xl">{styling.icon}</span>
							<div>
								<h3 className="font-semibold text-lg">{bank.displayName}</h3>
								<p className="text-white/80 text-sm">{bank.bankType === 'central' ? 'Central Bank' : 'Commercial Bank'}</p>
							</div>
						</div>
						<div className="bg-white/20 px-3 py-1 rounded-full">
							<span className="text-xs font-medium">{bank.code.toUpperCase()}</span>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="space-y-4">
						{/* Status */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600">Status</span>
							<div className="flex items-center space-x-2">
								<div className={`w-2 h-2 rounded-full ${bank.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
								<span className={`text-sm font-medium ${bank.isActive ? 'text-green-600' : 'text-red-600'}`}>
									{bank.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>
						</div>

						{/* Current rate with lazy loading */}
						<CurrentRateDisplay bankCode={bank.code} bankType={bank.bankType} />

						{/* Bank type specific info */}
						{bank.bankType === 'central' ? (
							<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
								<p className="text-sm text-purple-700">
									Official reference rates from Central Bank of Sri Lanka
								</p>
							</div>
						) : (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
								<p className="text-sm text-blue-700">
									Real-time buying and selling rates for currency exchange
								</p>
							</div>
						)}
					</div>

					{/* Action */}
					<div className="mt-6 pt-4 border-t border-gray-100">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
								View Details
							</span>
							<svg 
								className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
